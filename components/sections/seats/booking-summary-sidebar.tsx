"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PAYMENT_METHODS = ["gcash", "maya", "card"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface SelectedSeatChip {
  id: string;
  label: string;
}

interface BookingSummarySidebarProps {
  pricePerSeat: number;
  selectedCount: number;
  total: number;
  selectedSeats: SelectedSeatChip[];
  onRemoveSeat: (id: string) => void;
  seatTypeLabel: string;
}

export function BookingSummarySidebar({
  pricePerSeat,
  selectedCount,
  total,
  selectedSeats,
  onRemoveSeat,
  seatTypeLabel,
}: BookingSummarySidebarProps) {
  const [payment, setPayment] = useState<PaymentMethod>("gcash");
  const router = useRouter();

  const handleCheckout = () => {
    if (typeof window !== "undefined") {
      const summary = {
        selectedSeats: selectedSeats.map((s) => s.label),
        seatIds: selectedSeats.map((s) => s.id),
        subtotal: total,
        serviceFee: selectedCount * 50.0,
        total: total + selectedCount * 50.0,
        seatTypeLabel,
        paymentMethod: payment,
      };
      localStorage.setItem("checkout_summary", JSON.stringify(summary));
      router.push("/checkout");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-on-background bg-surface-variant px-6 py-5 shadow-[0_-6px_0_0_#1c1b1b] md:px-12">
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        
        {/* Left Section: Selected Seat Chips */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2 select-none">
            <span className="font-headline text-lg font-extrabold uppercase text-secondary">Your Selection</span>
            <span className="h-2 w-2 bg-secondary rounded-full" />
            <span className="font-label text-xs uppercase font-extrabold tracking-wide text-primary">
              {selectedCount} Seats
            </span>
          </div>
          
          {selectedSeats.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-[84px] overflow-y-auto pr-2">
              {selectedSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => onRemoveSeat(seat.id)}
                  title={`Remove ${seat.label}`}
                  className="inline-flex items-center gap-1 border-2 border-on-background bg-tertiary-fixed px-2.5 py-1 font-label text-[10px] font-extrabold uppercase text-on-background shadow-[2px_2px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#1c1b1b] hover:bg-secondary hover:text-white active:translate-x-0 active:translate-y-0 active:shadow-none"
                >
                  <span>{seat.label}</span>
                  <span className="font-extrabold text-[10px] leading-none">✕</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-sm text-outline select-none">
              Select seats on the grid above to book.
            </p>
          )}
        </div>

        {/* Middle Section: Payment Methods */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          <p className="font-label text-[10px] uppercase font-extrabold opacity-75 select-none">Choose Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label key={method} className="cursor-pointer">
                <input
                  type="radio"
                  name={`payment-${seatTypeLabel}`}
                  checked={payment === method}
                  onChange={() => setPayment(method)}
                  className="hidden"
                />
                <div
                  className={[
                    "border-2 py-2 text-center font-label text-xs font-bold uppercase transition-all select-none",
                    payment === method
                      ? "border-on-background bg-secondary text-white shadow-[2px_2px_0_0_#1c1b1b]"
                      : "border-outline bg-background text-on-background hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#1c1b1b] hover:border-on-background active:translate-x-0 active:translate-y-0 active:shadow-none",
                  ].join(" ")}
                >
                  {method === "gcash" ? "GCash" : method === "maya" ? "Maya" : "Card"}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Right Section: Pricing & Checkout CTA */}
        <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-on-background/10 pt-4 md:pt-0">
          <div className="text-right select-none">
            <p className="font-label text-[10px] uppercase font-extrabold opacity-75">Total Amount</p>
            <p className="font-headline text-3xl font-extrabold text-secondary tracking-tight">
              ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <button
            disabled={!selectedCount}
            onClick={handleCheckout}
            className="border-4 border-on-background bg-secondary px-8 py-3.5 font-headline text-base font-extrabold uppercase text-white shadow-[4px_4px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1c1b1b] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
}
