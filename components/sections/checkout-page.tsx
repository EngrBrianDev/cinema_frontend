"use client";

import { useEffect, useState } from "react";
import { PaymentMethodTabs } from "@/components/sections/payment-method-tabs";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";
import { checkoutSummary as mockSummary } from "@/lib/mock-data/cinema-data";
import { useAuth } from "@/context/auth-context";

export function CheckoutPage() {
  const [summary, setSummary] = useState<any>(null);
  const { user, loginWithGoogle, loading: authLoading } = useAuth();

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
            <div className="border-t-2 border-on-background/10 pt-6 flex justify-center w-full">
              <div id="google-checkout-signin-btn" className="w-full flex justify-center"></div>
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
              <div className="flex justify-between border-b border-on-background/10 pb-2">
                <span className="font-label text-xs uppercase opacity-75">Service Fee:</span>
                <span className="font-bold">₱{displayServiceFee.toFixed(2)}</span>
              </div>
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
    </div>
  );
}
