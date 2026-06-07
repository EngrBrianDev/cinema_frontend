"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckoutSeatPreview } from "@/components/sections/checkout-seat-preview";
import { PaymentMethodTabs } from "@/components/sections/payment-method-tabs";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import {
  clearPendingPaypalReservationIds,
  getUnavailableSelectedSeats,
  getPendingPaypalReservationIds,
  releasePendingPaypalReservations,
} from "@/lib/checkout-reservations";

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

  // Check URL parameters for PayPal transaction callback
  useEffect(() => {
    async function handlePaypalReturn() {
      const success = searchParams.get("payment_success");
      const cancel = searchParams.get("payment_cancel");
      const token = searchParams.get("token"); // PayPal Order ID

      if (success === "true" && token) {
        handlePaypalCapture(token);
      } else if (cancel === "true") {
        try {
          await releasePendingPaypalReservations();
        } catch (err) {
          console.error("Failed to release PayPal reservations after cancellation:", err);
        }
        setCancelWarning("Payment was cancelled on PayPal. You may try again or choose another method.");
        // Clean query parameters from URL
        router.replace("/checkout");
      } else if (getPendingPaypalReservationIds().length > 0) {
        try {
          await releasePendingPaypalReservations();
          setCancelWarning("Your PayPal attempt was not completed. You may try again or choose another method.");
        } catch (err) {
          console.error("Failed to release stale PayPal reservations:", err);
          setCancelWarning("Your previous PayPal attempt was not completed. Please cancel checkout or try again.");
        }
      }
    }

    handlePaypalReturn();
  }, [searchParams, router]);

  useEffect(() => {
    if (!summaryChecked || !summary || seatUnavailableModalOpen) return;

    let cancelled = false;

    async function checkSelectedSeats() {
      try {
        const unavailable = await getUnavailableSelectedSeats(summary.cinemaId, summary.selectedSeats);
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

  const handlePaypalCapture = async (paypalOrderId: string) => {
    // Prevent double invocation
    if (isCapturing || captureSuccess) return;

    setIsCapturing(true);
    setCaptureError(null);
    setCancelWarning(null);

    try {
      const result = await apiFetch("/payments/paypal/capture", {
        method: "POST",
        body: {
          paypalOrderId,
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
      clearPendingPaypalReservationIds();
    } catch (err: any) {
      console.error("PayPal Capture failed:", err);
      if (summary) {
        try {
          const unavailable = await getUnavailableSelectedSeats(summary.cinemaId, summary.selectedSeats);
          if (unavailable.length > 0) {
            setUnavailableSeats(unavailable);
            setSeatUnavailableModalOpen(true);
            return;
          }
        } catch (availabilityErr) {
          console.error("Failed to check seat availability after PayPal capture error:", availabilityErr);
        }
      }
      setCaptureError(err.message || "Failed to confirm payment with PayPal. Please try again.");
    } finally {
      setIsCapturing(false);
      // Clean query parameters from URL
      router.replace("/checkout");
    }
  };

  const handleUnavailableSeatsConfirm = async () => {
    try {
      await releasePendingPaypalReservations();
    } catch (err) {
      console.error("Failed to release pending PayPal reservations:", err);
    }
    localStorage.removeItem("checkout_summary");
    sessionStorage.removeItem("checkout_entry_allowed");
    clearPendingPaypalReservationIds();
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
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
              We are verifying and finalizing your transaction with PayPal. Please do not close this window or navigate away.
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
    <div className="mx-auto w-full max-w-7xl px-4 md:px-12 space-y-8 overflow-x-hidden pt-10 lg:pt-8">
      <SectionTitle title="Secure Checkout" subtitle="Choose your payment method and complete your booking." />
      
      {captureError && (
        <div className="border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {captureError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 w-full min-w-0">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6 animate-scale-up">
            <div className="border-b-4 border-on-background pb-3">
              <p className="font-label text-[10px] font-black uppercase text-outline">
                PayPal Interrupted
              </p>
              <h3 className="mt-1 font-headline text-xl font-black uppercase text-secondary">
                Payment Not Completed
              </h3>
            </div>

            <p className="font-body-md text-sm leading-relaxed text-on-background">
              {cancelWarning} Your seats are ready to review again here. You can try PayPal once more or choose another payment method.
            </p>

            <button
              type="button"
              onClick={() => setCancelWarning(null)}
              className="w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Continue Checkout
            </button>
          </div>
        </div>
      )}

      {seatUnavailableModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6 animate-scale-up">
            <div className="border-b-4 border-on-background pb-3">
              <p className="font-label text-[10px] font-black uppercase text-outline">
                Seat Unavailable
              </p>
              <h3 className="mt-1 font-headline text-xl font-black uppercase text-secondary">
                Please choose again
              </h3>
            </div>

            <p className="font-body-md text-sm leading-relaxed text-on-background">
              {unavailableSeats.join(", ")} {unavailableSeats.length === 1 ? "has" : "have"} already been taken by another completed booking. You'll be returned to the seat map to pick available seats.
            </p>

            <button
              type="button"
              onClick={handleUnavailableSeatsConfirm}
              className="w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Back to Seat Map
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6 animate-scale-up">
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
              className="w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Back to Movies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
