"use client";

import { useEffect, useState } from "react";
import { PaymentMethodTabs } from "@/components/sections/payment-method-tabs";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";
import { checkoutSummary as mockSummary } from "@/lib/mock-data/cinema-data";

export function CheckoutPage() {
  const [summary, setSummary] = useState<any>(null);

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
