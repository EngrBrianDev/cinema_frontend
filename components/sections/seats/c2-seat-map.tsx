"use client";

import { useMemo, useState } from "react";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { BookingSummarySidebar } from "@/components/sections/seats/booking-summary-sidebar";
import { SeatLegend } from "@/components/sections/seats/seat-legend";
import { SeatScreen } from "@/components/sections/seats/seat-screen";

const config = seatTypeConfigs.c2;
const RESERVED = new Set(config.reserved);

function getSeatLabel(index: number) {
  return `${config.rowLabels[Math.floor(index / config.cols)]}-${(index % config.cols) + 1}`;
}

export function C2SeatMap() {
  const [selected, setSelected] = useState<number[]>([]);

  const total = useMemo(() => selected.length * config.pricePerSeat, [selected.length]);
  const seatLabels = useMemo(
    () => [...selected].sort((a, b) => a - b).map(getSeatLabel),
    [selected],
  );

  const toggleSeat = (index: number) => {
    if (RESERVED.has(index)) return;
    setSelected((prev) => (prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]));
  };

  const removeByLabel = (label: string) => {
    setSelected((prev) => prev.filter((id) => getSeatLabel(id) !== label));
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="flex flex-col items-center lg:col-span-8">
        <SeatScreen />

        <div className="railroad-border relative w-full max-w-3xl bg-on-background/5 p-8 md:p-12">
          <div className="absolute bottom-24 left-3 top-8 flex flex-col justify-between font-label text-xs text-outline opacity-60">
            {config.rowLabels.map((row) => (
              <span key={row}>{row}</span>
            ))}
          </div>

          <div className="ml-6 grid grid-cols-12 gap-2 md:gap-3">
            {Array.from({ length: config.rows * config.cols }).map((_, index) => {
              const isReserved = RESERVED.has(index);
              const isSelected = selected.includes(index);

              return (
                <button
                  key={index}
                  onClick={() => toggleSeat(index)}
                  disabled={isReserved}
                  aria-label={
                    isReserved
                      ? "Reserved"
                      : isSelected
                        ? `Deselect ${getSeatLabel(index)}`
                        : `Select ${getSeatLabel(index)}`
                  }
                  className={[
                    "aspect-square w-full select-none rounded-sm border-2 text-[10px] font-bold transition-all duration-100",
                    isReserved
                      ? "cursor-not-allowed border-outline-variant bg-on-background opacity-40"
                      : isSelected
                        ? "seat-pop border-white bg-secondary shadow-[2px_2px_0_0_#ffffff] hover:opacity-90"
                        : "border-outline bg-surface-variant text-on-background shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] hover:scale-110 hover:border-secondary active:scale-95",
                  ].join(" ")}
                >
                  {isReserved && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>
                      close
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <SeatLegend />
        </div>
      </div>

      <BookingSummarySidebar
        pricePerSeat={config.pricePerSeat}
        selectedCount={selected.length}
        total={total}
        seatLabels={seatLabels}
        onRemoveSeat={removeByLabel}
        seatTypeLabel={config.label}
      />
    </div>
  );
}
