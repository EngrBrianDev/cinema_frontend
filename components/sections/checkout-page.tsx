"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckoutSeatPreview } from "@/components/sections/checkout-seat-preview";
import { PaymentMethodTabs } from "@/components/sections/payment-method-tabs";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import {
  getUnavailableSelectedSeats,
  clearPendingPaymongoReservationIds,
  clearPendingPaymongoSessionId,
  getPendingPaymongoReservationIds,
  getPendingPaymongoSessionId,
  releasePendingPaymongoReservations,
} from "@/lib/checkout-reservations";

async function checkSummarySeatsAvailability(summary: any) {
  if (!summary) return [];
  const unavailable: string[] = [];
  if (summary.seats && summary.seats.length > 0) {
    const seatsByCinema: Record<string, string[]> = {};
    for (const seat of summary.seats) {
      if (!seatsByCinema[seat.cinemaId]) {
        seatsByCinema[seat.cinemaId] = [];
      }
      seatsByCinema[seat.cinemaId].push(seat.label);
    }
    for (const [cinemaId, seatLabels] of Object.entries(seatsByCinema)) {
      const res = await getUnavailableSelectedSeats(cinemaId, seatLabels);
      unavailable.push(...res);
    }
  } else {
    const res = await getUnavailableSelectedSeats(summary.cinemaId, summary.selectedSeats);
    unavailable.push(...res);
  }
  return unavailable;
}

export function CheckoutPage() {
  const [summary, setSummary] = useState<any>(null);
  const [summaryChecked, setSummaryChecked] = useState(false);
  const { user, loginWithGoogle, loading: authLoading } = useAuth();
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Capture states
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [cancelWarning, setCancelWarning] = useState<string | null>(null);
  const captureTriggeredRef = useRef(false);
  const [unavailableSeats, setUnavailableSeats] = useState<string[]>([]);
  const [seatUnavailableModalOpen, setSeatUnavailableModalOpen] = useState(false);

  // Success Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkoutEntryAllowed = sessionStorage.getItem("checkout_entry_allowed") === "true";
      const stored = localStorage.getItem("checkout_summary");
      if (checkoutEntryAllowed && stored) {
        try {
          const parsed = JSON.parse(stored);
          const hasSeats =
            Array.isArray(parsed.selectedSeats) &&
            parsed.selectedSeats.length > 0 &&
            Array.isArray(parsed.seatIds) &&
            parsed.seatIds.length > 0;

          if (hasSeats) {
            setSummary(parsed);
          } else {
            localStorage.removeItem("checkout_summary");
            sessionStorage.removeItem("checkout_entry_allowed");
            router.replace("/seats");
          }
        } catch (e) {
          console.error("Failed to parse checkout summary:", e);
          localStorage.removeItem("checkout_summary");
          sessionStorage.removeItem("checkout_entry_allowed");
          router.replace("/seats");
        }
      } else {
        localStorage.removeItem("checkout_summary");
        sessionStorage.removeItem("checkout_entry_allowed");
        router.replace("/seats");
      }
      setSummaryChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (!summaryChecked || !summary) return;

    const checkoutUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({ checkoutLocked: true }, "", checkoutUrl);
    window.history.pushState({ checkoutLocked: true }, "", checkoutUrl);

    const keepUserOnCheckout = () => {
      const checkoutEntryAllowed = sessionStorage.getItem("checkout_entry_allowed") === "true";
      const hasSummary = Boolean(localStorage.getItem("checkout_summary"));

      if (!checkoutEntryAllowed || !hasSummary) return;

      window.history.replaceState({ checkoutLocked: true }, "", "/checkout");
      window.history.pushState({ checkoutLocked: true }, "", "/checkout");
      setTimeout(() => router.replace("/checkout"), 0);
    };

    window.addEventListener("popstate", keepUserOnCheckout);

    return () => {
      window.removeEventListener("popstate", keepUserOnCheckout);
    };
  }, [summaryChecked, summary, router]);

  // Check URL parameters for transaction callbacks (QR Ph)
  useEffect(() => {
    async function handleReturn() {
      // Guard: do not clean up or process callback if we are currently capturing or if it was already successful
      if (isCapturing || captureSuccess || captureTriggeredRef.current) {
        return;
      }

      const success = searchParams.get("payment_success");
      const cancel = searchParams.get("payment_cancel");
      const gateway = searchParams.get("gateway");

      const hasCallbackParams = typeof window !== "undefined" && 
        (window.location.search.includes("payment_success") || window.location.search.includes("payment_cancel"));

      // Hydration Guard: Next.js reads searchParams asynchronously. If the URL contains callback parameters,
      // wait until searchParams is fully populated before executing check/cleanup to avoid false interruption trigger.
      if (hasCallbackParams && !gateway) {
        return;
      }

      if (gateway === "paymongo") {
        if (success === "true") {
          const sessionId = getPendingPaymongoSessionId();
          if (sessionId) {
            handlePaymongoCapture(sessionId);
          } else {
            setCaptureError("No pending QR Ph payment session found.");
            router.replace("/checkout");
          }
        } else if (cancel === "true") {
          try {
            await releasePendingPaymongoReservations();
          } catch (err) {
            console.error("Failed to release QR Ph reservations after cancellation:", err);
          }
          setCancelWarning("Payment was cancelled on QR Ph. You may try again.");
          router.replace("/checkout");
        }
      } else {
        // If no callback parameters, clean up stale/abandoned checkout sessions if they exist
        if (getPendingPaymongoReservationIds().length > 0) {
          try {
            await releasePendingPaymongoReservations();
            setCancelWarning("Your QR Ph payment attempt was not completed. You may try again.");
          } catch (err) {
            console.error("Failed to release stale QR Ph reservations:", err);
            setCancelWarning("Your previous QR Ph attempt was not completed. Please cancel checkout or try again.");
          }
        }
      }
    }

    handleReturn();
  }, [searchParams, router, isCapturing, captureSuccess]);

  useEffect(() => {
    if (!summaryChecked || !summary || seatUnavailableModalOpen) return;

    let cancelled = false;

    async function checkSelectedSeats() {
      try {
        const unavailable = await checkSummarySeatsAvailability(summary);
        if (!cancelled && unavailable.length > 0) {
          setUnavailableSeats(unavailable);
          setSeatUnavailableModalOpen(true);
        }
      } catch (err) {
        console.error("Failed to check selected seat availability:", err);
      }
    }

    checkSelectedSeats();
    window.addEventListener("focus", checkSelectedSeats);
    window.addEventListener("pageshow", checkSelectedSeats);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", checkSelectedSeats);
      window.removeEventListener("pageshow", checkSelectedSeats);
    };
  }, [summaryChecked, summary, seatUnavailableModalOpen]);

  const handlePaymongoCapture = async (checkoutSessionId: string) => {
    // Prevent double invocation
    if (isCapturing || captureSuccess || captureTriggeredRef.current) return;
    captureTriggeredRef.current = true;

    setIsCapturing(true);
    setCaptureError(null);
    setCancelWarning(null);

    try {
      const result = await apiFetch("/payments/paymongo/capture", {
        method: "POST",
        body: {
          checkoutSessionId,
        },
      });

      setCaptureSuccess(true);
      const ticketNums = result.tickets.map((t: any) => t.ticketNumber).join(", ");
      
      setModalTitle("Payment Successful!");
      setModalBody(`Thank you! Your payment has been processed successfully.\n\nDigital ticket(s) ${ticketNums} has been sent to your email.`);
      setModalOpen(true);

      // Clear summary from local storage
      localStorage.removeItem("checkout_summary");
      sessionStorage.removeItem("checkout_entry_allowed");
      clearPendingPaymongoReservationIds();
      clearPendingPaymongoSessionId();
    } catch (err: any) {
      console.error("PayMongo Capture failed:", err);
      captureTriggeredRef.current = false;
      if (summary) {
        try {
          const unavailable = await checkSummarySeatsAvailability(summary);
          if (unavailable.length > 0) {
            setUnavailableSeats(unavailable);
            setSeatUnavailableModalOpen(true);
            return;
          }
        } catch (availabilityErr) {
          console.error("Failed to check seat availability after PayMongo capture error:", availabilityErr);
        }
      }
      setCaptureError(err.message || "Failed to confirm payment with PayMongo. Please try again.");
    } finally {
      setIsCapturing(false);
      // Clean query parameters from URL
      router.replace("/checkout");
    }
  };
  const handleUnavailableSeatsConfirm = async () => {
    try {
      await releasePendingPaymongoReservations();
    } catch (err) {
      console.error("Failed to release pending PayMongo reservations:", err);
    }
    localStorage.removeItem("checkout_summary");
    sessionStorage.removeItem("checkout_entry_allowed");
    clearPendingPaymongoReservationIds();
    clearPendingPaymongoSessionId();
    router.push("/seats");
  };

  const handleModalClose = () => {
    setModalOpen(false);
    sessionStorage.removeItem("checkout_entry_allowed");
    router.push("/");
  };

  // Google sign in rendering inside CheckoutPage when user is logged out
  useEffect(() => {
    if (user || authLoading) return;
    
    let attempts = 0;
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google) {
        clearInterval(interval);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
            callback: async (response: any) => {
              try {
                await loginWithGoogle(response.credential);
              } catch (err: any) {
                alert(`Authentication failed: ${err.message || err}`);
              }
            },
          });

          const buttonParent = document.getElementById("google-checkout-signin-btn");
          if (buttonParent) {
            (window as any).google.accounts.id.renderButton(buttonParent, {
              theme: "filled_blue",
              size: "large",
              width: 280,
            });
          }
        } catch (err) {
          console.error("Error initializing Google login on checkout:", err);
        }
      } else {
        attempts++;
        if (attempts > 20) clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [user, authLoading, loginWithGoogle]);

  if (!summaryChecked || !summary) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <div className="motion-card w-full max-w-md rounded border-2 border-black bg-white p-6">
          <div className="motion-loading skeleton-block h-8 w-1/2" />
          <div className="motion-loading skeleton-block mt-4 h-4 w-full" />
          <div className="motion-loading skeleton-block mt-3 h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <div className="motion-card w-full max-w-md rounded border-2 border-black bg-white p-6">
          <div className="motion-loading skeleton-block h-8 w-1/2" />
          <div className="motion-loading skeleton-block mt-4 h-4 w-full" />
          <div className="motion-loading skeleton-block mt-3 h-4 w-4/5" />
        </div>
      </div>
    );
  }

  // Display capture loading state
  if (isCapturing) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24">
        <HardShadowCard shadow="yellow">
          <div className="p-6 text-center space-y-6 flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            <h2 className="font-headline text-2xl font-black uppercase text-secondary">
              Confirming Payment
            </h2>
            <p className="font-body-md text-sm text-outline max-w-xs leading-relaxed">
              We are verifying and finalizing your transaction. Please do not close this window or navigate away.
            </p>
          </div>
        </HardShadowCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <HardShadowCard shadow="black">
          <div className="p-4 text-center space-y-6 flex flex-col items-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-on-background bg-tertiary-fixed text-on-background shadow-[2px_2px_0_0_#1c1b1b]">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              </svg>
            </div>
            <h2 className="font-headline text-2xl font-black uppercase text-secondary">
              Sign In Required
            </h2>
            <p className="font-body-md text-sm text-outline max-w-xs">
              You must be signed in with Google to view your order summary and complete your secure checkout.
            </p>
            <div className="border-t-2 border-on-background/10 pt-6 flex flex-col items-center gap-3 w-full">
              <div id="google-checkout-signin-btn" className="w-full flex justify-center"></div>
              
              {/* FE-HIGH-02 FIX: Dev login only in non-production */}
              {process.env.NODE_ENV !== "production" && (
              <button
                onClick={async () => {
                  try {
                    await loginWithGoogle("dev-token-customer");
                  } catch (err: any) {
                    alert(`Authentication failed: ${err.message || err}`);
                  }
                }}
                className="w-full max-w-[280px] border-4 border-on-background bg-tertiary-fixed py-2.5 font-headline text-xs font-bold uppercase shadow-[2px_2px_0_0_#1c1b1b] hover:bg-[#ffe88f] cursor-pointer"
              >
                Use Dev Login
              </button>
              )}
            </div>
          </div>
        </HardShadowCard>
      </div>
    );
  }

  const displaySubtotal = summary.subtotal;
  const displayServiceFee = summary.serviceFee;
  const displayTotal = summary.total;
  const selectedSeatsText = summary.selectedSeats.join(", ");
  const seatTypeLabel = summary.seatTypeLabel;

  return (
    <div className="motion-panel mx-auto w-full max-w-7xl px-4 md:px-12 space-y-8 overflow-x-hidden pt-10 lg:pt-8">
      <SectionTitle title="Secure Checkout" subtitle="Choose your payment method and complete your booking." />
      
      {captureError && (
        <div className="motion-error border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {captureError}
        </div>
      )}

      <div className="motion-stagger grid gap-6 lg:grid-cols-12 w-full min-w-0">
        <div className="space-y-6 lg:col-span-5 min-w-0 overflow-hidden">
          <HardShadowCard shadow="black">
            <p className="font-label text-xs uppercase text-outline">Order Summary</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-on-background/10 pb-2">
                <span className="font-label text-xs uppercase opacity-75">Ticket Type:</span>
                <span className="font-bold text-sm">{seatTypeLabel}</span>
              </div>
              <div className="flex justify-between border-b border-on-background/10 pb-2">
                <span className="font-label text-xs uppercase opacity-75">Selected Seats:</span>
                <span className="font-bold text-sm text-secondary truncate max-w-[200px]" title={selectedSeatsText}>
                  {selectedSeatsText}
                </span>
              </div>
              <div className="flex justify-between border-b border-on-background/10 pb-2">
                <span className="font-label text-xs uppercase opacity-75">Subtotal:</span>
                <span className="font-bold">₱{displaySubtotal.toFixed(2)}</span>
              </div>
              {displayServiceFee > 0 && (
                <div className="flex justify-between border-b border-on-background/10 pb-2">
                  <span className="font-label text-xs uppercase opacity-75">Service Fee:</span>
                  <span className="font-bold">₱{displayServiceFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-end justify-between pt-2">
                <span className="font-label text-sm font-bold uppercase">Total Amount:</span>
                <span className="font-headline text-3xl font-extrabold text-secondary">
                  ₱{displayTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </HardShadowCard>
          <HardShadowCard shadow="black">
            <CheckoutSeatPreview selectedSeats={summary.selectedSeats} seatTypeLabel={seatTypeLabel} />
          </HardShadowCard>
        </div>
        <div className="lg:col-span-7 min-w-0 overflow-hidden">
          <HardShadowCard shadow="yellow">
            <PaymentMethodTabs />
          </HardShadowCard>
        </div>
      </div>

      {cancelWarning && !seatUnavailableModalOpen && !modalOpen && (
        <div
          className="motion-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="motion-modal w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6">
            <div className="border-b-4 border-on-background pb-3">
              <p className="font-label text-[10px] font-black uppercase text-outline">
                Payment Interrupted
              </p>
              <h3 className="mt-1 font-headline text-xl font-black uppercase text-secondary">
                Payment Not Completed
              </h3>
            </div>

            <p className="font-body-md text-sm leading-relaxed text-on-background">
              {cancelWarning} Your seats are ready to review again here. You can try to pay once more to complete your booking.
            </p>

            <button
              type="button"
              onClick={() => setCancelWarning(null)}
              className="motion-button w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
            >
              Continue Checkout
            </button>
          </div>
        </div>
      )}

      {seatUnavailableModalOpen && (
        <div
          className="motion-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="motion-modal w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6">
            <div className="border-b-4 border-on-background pb-3">
              <p className="font-label text-[10px] font-black uppercase text-outline">
                Seat Unavailable
              </p>
              <h3 className="mt-1 font-headline text-xl font-black uppercase text-secondary">
                Please choose again
              </h3>
            </div>

            <p className="font-body-md text-sm leading-relaxed text-on-background">
              {unavailableSeats.join(", ")} {unavailableSeats.length === 1 ? "has" : "have"} already been taken by another completed booking. You&apos;ll be returned to the seat map to pick available seats.
            </p>

            <button
              type="button"
              onClick={handleUnavailableSeatsConfirm}
              className="motion-button w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
            >
              Back to Seat Map
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modalOpen && (
        <div className="motion-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="motion-modal w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6">
            <div className="flex items-center justify-between border-b-4 border-on-background pb-3">
              <h3 className="font-headline text-xl font-black uppercase text-secondary">
                {modalTitle}
              </h3>
            </div>
            
            <p className="font-body-md text-sm text-on-background leading-relaxed whitespace-pre-line">
              {modalBody}
            </p>

            <button
              onClick={handleModalClose}
              className="motion-button w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
            >
              Back to Movies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
