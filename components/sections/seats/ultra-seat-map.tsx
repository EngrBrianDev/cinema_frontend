"use client";

import { useMemo, useState } from "react";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { BookingSummarySidebar } from "@/components/sections/seats/booking-summary-sidebar";
import { SeatLegend } from "@/components/sections/seats/seat-legend";
import { SeatScreen } from "@/components/sections/seats/seat-screen";

const config = seatTypeConfigs.ultra;
const RESERVED = new Set(config.reserved);
const AISLE_AFTER = config.aisleAfterCol ?? 3;

function getSeatLabel(rowIndex: number, colIndex: number) {
  return `${config.rowLabels[rowIndex]}-${colIndex + 1}`;
}

function getSeatIndex(rowIndex: number, colIndex: number) {
  return rowIndex * config.cols + colIndex;
}

export function UltraSeatMap() {
  const [selected, setSelected] = useState<number[]>([]);

  const total = useMemo(() => selected.length * config.pricePerSeat, [selected.length]);
  const seatLabels = useMemo(() => {
    return [...selected]
      .sort((a, b) => a - b)
      .map((index) => {
        const rowIndex = Math.floor(index / config.cols);
        const colIndex = index % config.cols;
        return getSeatLabel(rowIndex, colIndex);
      });
  }, [selected]);

  const toggleSeat = (index: number) => {
    if (RESERVED.has(index)) return;
    setSelected((prev) => (prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]));
  };

  const removeByLabel = (label: string) => {
    setSelected((prev) =>
      prev.filter((id) => {
        const rowIndex = Math.floor(id / config.cols);
        const colIndex = id % config.cols;
        return getSeatLabel(rowIndex, colIndex) !== label;
      }),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="flex flex-col items-center lg:col-span-8">
        <SeatScreen />

        <div className="relative w-full max-w-2xl border-4 border-tertiary bg-gradient-to-b from-on-background/10 to-on-background/30 p-8 md:p-10">
          <div className="absolute -right-3 -top-3 rotate-6 border-2 border-white bg-tertiary px-3 py-1 font-label text-[10px] font-bold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b]">
            Premium
          </div>

          <div className="space-y-3">
            {config.rowLabels.map((rowLabel, rowIndex) => (
              <div key={rowLabel} className="flex items-center gap-3">
                <span className="w-5 font-label text-xs font-bold text-outline opacity-60">{rowLabel}</span>

                <div className="flex flex-1 items-center justify-center gap-2">
                  {Array.from({ length: config.cols }).map((_, colIndex) => {
                    const index = getSeatIndex(rowIndex, colIndex);
                    const isReserved = RESERVED.has(index);
                    const isSelected = selected.includes(index);
                    const showAisle = colIndex === AISLE_AFTER;

                    return (
                      <div key={colIndex} className="flex items-center gap-2">
                        {showAisle ? <div className="w-6 shrink-0" aria-hidden /> : null}
                        <button
                          onClick={() => toggleSeat(index)}
                          disabled={isReserved}
                          aria-label={
                            isReserved
                              ? "Reserved"
                              : isSelected
                                ? `Deselect ${getSeatLabel(rowIndex, colIndex)}`
                                : `Select ${getSeatLabel(rowIndex, colIndex)}`
                          }
                          className={[
                            "h-10 w-10 shrink-0 select-none rounded-md border-2 text-[10px] font-bold transition-all duration-100",
                            isReserved
                              ? "cursor-not-allowed border-outline-variant bg-on-background opacity-40"
                              : isSelected
                                ? "seat-pop border-white bg-tertiary text-white shadow-[2px_2px_0_0_#ffe16d] hover:opacity-90"
                                : "border-tertiary bg-tertiary-fixed text-on-background shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] hover:scale-110 hover:border-secondary active:scale-95",
                          ].join(" ")}
                        >
                          {isReserved ? (
                            <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>
                              close
                            </span>
                          ) : (
                            colIndex + 1
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center font-label text-[10px] uppercase tracking-widest text-outline">
            Center aisle — wider recliner layout
          </p>

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
