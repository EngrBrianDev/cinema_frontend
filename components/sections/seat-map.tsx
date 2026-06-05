"use client";

import { useMemo, useState } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";

const PRICE_PER_SEAT = 350;
const rows = 10;
const cols = 12;
const reserved = new Set([12, 13, 24, 25, 45, 46, 47, 68, 69, 70, 71, 82, 83, 100, 101, 115]);

export function SeatMap() {
  const [selected, setSelected] = useState<number[]>([]);

  const total = useMemo(() => selected.length * PRICE_PER_SEAT, [selected.length]);

  const toggleSeat = (id: number) => {
    if (reserved.has(id)) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <HardShadowCard shadow="black">
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: rows * cols }).map((_, index) => {
            const isReserved = reserved.has(index);
            const isSelected = selected.includes(index);
            return (
              <button
                key={index}
                onClick={() => toggleSeat(index)}
                className={`aspect-square rounded border text-[10px] font-bold ${
                  isReserved
                    ? "cursor-not-allowed border-outline-variant bg-black/70 text-white/60"
                    : isSelected
                      ? "border-white bg-secondary text-white"
                      : "border-outline bg-surface-variant text-on-background"
                }`}
              >
                {isReserved ? "X" : index + 1}
              </button>
            );
          })}
        </div>
      </HardShadowCard>
      <div className="lg:col-span-4">
        <HardShadowCard shadow="yellow">
          <h3 className="font-headline text-2xl font-bold uppercase text-secondary">Order Summary</h3>
          <p className="mt-4 font-label text-xs uppercase text-outline">Price per seat: P{PRICE_PER_SEAT.toFixed(2)}</p>
          <p className="mt-2 font-label text-xs uppercase text-outline">Selected Seats: {selected.length}</p>
          <p className="mt-4 font-headline text-3xl font-extrabold text-secondary">P{total.toFixed(2)}</p>
          <PrimaryButton disabled={!selected.length} className="mt-6 w-full">
            Pay and Reserve Seats
          </PrimaryButton>
        </HardShadowCard>
      </div>
    </div>
  );
}
