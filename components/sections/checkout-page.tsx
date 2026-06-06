"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PaymentMethodTabs } from "@/components/sections/payment-method-tabs";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";
import { checkoutSummary as mockSummary } from "@/lib/mock-data/cinema-data";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export function CheckoutPage() {
  const [summary, setSummary] = useState<any>(null);
  const { user, loginWithGoogle, loading: authLoading } = useAuth();
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Capture states
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [cancelWarning, setCancelWarning] = useState<string | null>(null);

  // Success Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("checkout_summary");
      if (stored) {
        try {
          setSummary(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse checkout summary:", e);
        }
      }
    }
  }, []);

  // Check URL parameters for PayPal transaction callback
  useEffect(() => {
    const success = searchParams.get("payment_success");
    const cancel = searchParams.get("payment_cancel");
    const token = searchParams.get("token"); // PayPal Order ID

    if (success === "true" && token) {
      handlePaypalCapture(token);
    } else if (cancel === "true") {
      setCancelWarning("Payment was cancelled on PayPal. You may try again or choose another method.");
      // Clean query parameters from URL
      router.replace("/checkout");
    }
  }, [searchParams]);

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
    } catch (err: any) {
      console.error("PayPal Capture failed:", err);
      setCaptureError(err.message || "Failed to confirm payment with PayPal. Please try again.");
    } finally {
      setIsCapturing(false);
      // Clean query parameters from URL
      router.replace("/checkout");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
            </div>
          </div>
        </HardShadowCard>
      </div>
    );
  }

  if (!summary || !summary.selectedSeats || summary.selectedSeats.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <HardShadowCard shadow="black">
          <div className="p-4 text-center space-y-6 flex flex-col items-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-on-background bg-secondary text-white shadow-[2px_2px_0_0_#1c1b1b]">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <h2 className="font-headline text-2xl font-black uppercase text-secondary">
              No Seats Selected
            </h2>
            <p className="font-body-md text-sm text-outline max-w-xs leading-relaxed">
              Please select seats first before proceeding to checkout.
            </p>
            <div className="border-t-2 border-on-background/10 pt-6 w-full">
              <Link href="/seats">
                <button className="w-full border-4 border-on-background bg-tertiary-fixed py-2.5 font-headline text-xs font-bold uppercase shadow-[2px_2px_0_0_#1c1b1b] hover:bg-[#ffe88f] cursor-pointer">
                  Go Select Seats
                </button>
              </Link>
            </div>
          </div>
        </HardShadowCard>
      </div>
    );
  }

  const displaySubtotal = summary ? summary.subtotal : mockSummary.subtotal;
  const displayServiceFee = summary ? summary.serviceFee : mockSummary.serviceFee;
  const displayTotal = summary ? summary.total : mockSummary.total;
  const selectedSeatsText = summary && summary.selectedSeats ? summary.selectedSeats.join(", ") : "None";
  const seatTypeLabel = summary ? summary.seatTypeLabel : "C2 Seat";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-12 space-y-8">
      <SectionTitle title="Secure Checkout" subtitle="Choose your payment method and complete your booking." />
      
      {captureError && (
        <div className="border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {captureError}
        </div>
      )}

      {cancelWarning && (
        <div className="border-4 border-amber-500 bg-amber-500/10 p-4 font-body-md text-sm text-amber-600 font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {cancelWarning}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
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
        </div>
        <div className="lg:col-span-7">
          <HardShadowCard shadow="yellow">
            <PaymentMethodTabs />
          </HardShadowCard>
        </div>
      </div>

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
