"use client";

import { useRouter } from "next/navigation";

export interface SelectedSeatChip {
  id: string;
  label: string;
  cinemaId?: string;
  price?: number;
}

interface BookingSummarySidebarProps {
  pricePerSeat: number;
  selectedCount: number;
  total: number;
  selectedSeats: SelectedSeatChip[];
  onRemoveSeat: (id: string) => void;
  seatTypeLabel: string;
  cinemaId: string | undefined;
}

export function BookingSummarySidebar({
  pricePerSeat,
  selectedCount,
  total,
  selectedSeats,
  onRemoveSeat,
  seatTypeLabel,
  cinemaId,
}: BookingSummarySidebarProps) {
  const router = useRouter();

  const handleCheckout = () => {
    if (typeof window !== "undefined") {
      const summary = {
        selectedSeats: selectedSeats.map((s) => s.label),
        seatIds: selectedSeats.map((s) => s.id),
        seats: selectedSeats.map((s) => ({
          id: s.id,
          label: s.label,
          cinemaId: s.cinemaId || cinemaId,
          price: s.price !== undefined ? s.price : (total / (selectedSeats.length || 1)),
        })),
        subtotal: total,
        serviceFee: 0,
        total: total,
        seatTypeLabel,
        cinemaId,
      };
      localStorage.setItem("checkout_summary", JSON.stringify(summary));
      sessionStorage.setItem("checkout_entry_allowed", "true");
      router.push("/checkout", { transitionTypes: ["nav-forward"] });
    }
  };

  return (
    <div className="motion-panel fixed bottom-0 left-0 right-0 z-40 border-t-4 border-on-background bg-surface-variant px-4 py-3 md:px-12 md:py-5 shadow-[0_-6px_0_0_#1c1b1b]">
      <div className="mx-auto w-full max-w-7xl">
        {/* Mobile Layout (< md) */}
        <div className="md:hidden flex flex-col gap-2.5">
          {/* Row 1: Selected seats */}
          <div className="flex items-center justify-between gap-2 border-b border-dashed border-on-background/15 pb-2">
            <span className="font-label text-[10px] uppercase font-black text-secondary flex-shrink-0">
              Seats ({selectedCount}):
            </span>
            <div className="flex-1 overflow-x-auto flex gap-1.5 scrollbar-none py-0.5 whitespace-nowrap">
              {selectedSeats.length > 0 ? (
                selectedSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => onRemoveSeat(seat.id)}
                    title={`Remove ${seat.label}`}
                    className="motion-button inline-flex items-center gap-1 border border-on-background bg-tertiary-fixed px-2 py-0.5 font-label text-[9px] font-extrabold uppercase text-on-background shadow-[1px_1px_0_0_#1c1b1b] active:shadow-none"
                  >
                    <span>{seat.label}</span>
                    <span className="text-[8px] font-black">✕</span>
                  </button>
                ))
              ) : (
                <span className="font-body-md text-[11px] text-outline italic">No seats selected</span>
              )}
            </div>
          </div>

          {/* Row 2: Price info & Checkout button */}
          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="font-label text-[8px] uppercase font-extrabold opacity-75">Total</p>
                <p className="font-headline text-base font-extrabold text-secondary leading-none">
                  ₱{total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <button
                disabled={!selectedCount}
                onClick={handleCheckout}
                className="motion-button border-2 border-on-background bg-secondary px-4 py-2 font-headline text-xs font-black uppercase text-white shadow-[2px_2px_0_0_#1c1b1b] transition-all hover:bg-opacity-95 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout (>= md) */}
        <div className="hidden md:flex flex-row items-center justify-between gap-6">
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
                    className="motion-button inline-flex items-center gap-1 border-2 border-on-background bg-tertiary-fixed px-2.5 py-1 font-label text-[10px] font-extrabold uppercase text-on-background shadow-[2px_2px_0_0_#1c1b1b] transition-all hover:shadow-[3px_3px_0_0_#1c1b1b] hover:bg-secondary hover:text-white active:shadow-none"
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
              className="motion-button border-4 border-on-background bg-secondary px-8 py-3.5 font-headline text-base font-extrabold uppercase text-white shadow-[4px_4px_0_0_#1c1b1b] transition-all hover:shadow-[6px_6px_0_0_#1c1b1b] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
