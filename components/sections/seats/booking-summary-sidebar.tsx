"use client";

import { useState } from "react";

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

  return (
    <div className="lg:col-span-4 lg:sticky lg:top-32">
      <div className="hard-shadow-yellow border-4 border-on-background bg-surface-variant p-8 text-on-background">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-headline text-3xl font-bold uppercase text-secondary">Order Summary</h3>
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 36 }}>
            shopping_cart
          </span>
        </div>

        <p className="mb-4 font-label text-xs font-bold uppercase text-primary">{seatTypeLabel}</p>

        <div className="space-y-4">
          <div className="flex justify-between border-b-2 border-dashed border-on-background/20 pb-4">
            <span className="font-label text-xs uppercase opacity-70">Price per seat</span>
            <span className="font-bold">₱{pricePerSeat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b-2 border-dashed border-on-background/20 pb-4">
            <span className="font-label text-xs uppercase opacity-70">Selected Seats</span>
            <span className="font-bold">{selectedCount}</span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <span className="font-label text-base font-bold uppercase tracking-tight">Total Amount</span>
            <span className="font-headline text-4xl font-extrabold text-secondary">₱{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 border-t-2 border-dashed border-on-background/20 pt-6">
          <p className="mb-3 font-label text-xs uppercase opacity-70">Select Payment Method</p>
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
                    "border-2 py-2 text-center font-label text-xs font-bold uppercase transition-colors",
                    payment === method
                      ? "border-secondary bg-secondary text-white"
                      : "border-outline bg-background hover:border-secondary",
                  ].join(" ")}
                >
                  {method === "gcash" ? "GCash" : method === "maya" ? "Maya" : "Card"}
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="mt-6 border-t-2 border-dashed border-on-background/20 pt-6">
            <p className="mb-3 font-label text-xs uppercase opacity-70">Your Seats</p>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => onRemoveSeat(seat.id)}
                  title={`Remove ${seat.label}`}
                  className="border-2 border-secondary bg-secondary px-2 py-1 font-label text-xs font-bold text-white hover:bg-secondary/80"
                >
                  {seat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          disabled={!selectedCount}
          className="mt-8 w-full border-4 border-on-background bg-secondary px-6 py-4 font-headline text-lg font-extrabold uppercase text-white shadow-[4px_4px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1c1b1b] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
