"use client";

import { useMemo, useState } from "react";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { ultraAllRowSlots, type UltraSeatCell, type UltraSlot } from "@/lib/mock-data/ultra-seat-layout";
import { BookingSummarySidebar } from "@/components/sections/seats/booking-summary-sidebar";
import { SeatLegend } from "@/components/sections/seats/seat-legend";
import { SeatScreen } from "@/components/sections/seats/seat-screen";

const config = seatTypeConfigs.ultra;

const SEAT = "aspect-square w-[var(--u-seat)] h-[var(--u-seat)]";
const SEAT_TEXT = "text-[6px] sm:text-[7px]";

/** 19-column grid: extL×2 | label | 10,9 | aisle | 8,7 | gap | 6,5 | gap | 4,3 | aisle | 2,1 | extR×2 */
const GRID_TEMPLATE =
  "[grid-template-columns:var(--u-seat)_var(--u-seat)_var(--u-label)_var(--u-seat)_var(--u-seat)_var(--u-aisleL)_var(--u-seat)_var(--u-seat)_var(--u-gap)_var(--u-seat)_var(--u-seat)_var(--u-gap)_var(--u-seat)_var(--u-seat)_var(--u-aisleL)_var(--u-seat)_var(--u-seat)_var(--u-seat)_var(--u-seat)]";

function seatClass(isSelected: boolean): string {
  return [
    `flex aspect-square ${SEAT} select-none items-center justify-center rounded-sm border-2 ${SEAT_TEXT} font-bold leading-none transition-all duration-100`,
    isSelected
      ? "seat-pop border-white bg-secondary text-white shadow-[1px_1px_0_0_#ffffff] hover:opacity-90"
      : "border-outline bg-surface-variant text-on-background shadow-[1px_1px_0_0_rgba(0,0,0,0.2)] hover:scale-110 hover:border-secondary active:scale-95",
  ].join(" ");
}

function UltraSeatButton({
  seat,
  selected,
  onToggle,
}: {
  seat: UltraSeatCell;
  selected: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(seat.key)}
      aria-label={selected ? `Deselect ${seat.label}` : `Select ${seat.label}`}
      className={seatClass(selected)}
    >
      <span className="max-w-full truncate px-px">{seat.label}</span>
    </button>
  );
}

function renderSlot(
  slot: UltraSlot,
  index: number,
  selected: Set<string>,
  onToggle: (key: string) => void,
) {
  switch (slot.kind) {
    case "blank":
      return <div key={`blank-${index}`} className={SEAT} aria-hidden />;
    case "label":
      return (
        <span
          key={`label-${slot.row}`}
          className={`flex ${SEAT} w-full items-center justify-center font-label text-[10px] font-bold text-outline opacity-60 sm:text-xs`}
        >
          {slot.row}
        </span>
      );
    case "aisle":
      return (
        <div
          key={`aisle-${index}`}
          className={slot.size === "large" ? "min-w-[var(--u-aisleL)]" : "min-w-[var(--u-gap)]"}
          aria-hidden
        />
      );
    case "seat":
      return (
        <UltraSeatButton
          key={`seat-${index}`}
          seat={slot.seat}
          selected={selected.has(slot.seat.key)}
          onToggle={onToggle}
        />
      );
  }
}

export function UltraSeatMap() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSeat = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedSeats = useMemo(() => {
    const labelByKey = new Map<string, string>();
    for (const row of ultraAllRowSlots) {
      for (const slot of row) {
        if (slot.kind === "seat") {
          labelByKey.set(slot.seat.key, slot.seat.label);
        }
      }
    }
    return [...selected].map((key) => ({ id: key, label: labelByKey.get(key) ?? key }));
  }, [selected]);

  const total = selected.size * config.pricePerSeat;

  const removeById = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="flex flex-col items-center lg:col-span-8">
        <SeatScreen />

        <div
          className="railroad-border relative w-full bg-on-background/5 p-4 sm:p-6 sm:[--u-aisleL:1rem] sm:[--u-gap:0.375rem] sm:[--u-label:1.25rem] sm:[--u-seat:2rem]"
          style={
            {
              "--u-seat": "1.75rem",
              "--u-label": "1rem",
              "--u-aisleL": "0.75rem",
              "--u-gap": "0.25rem",
            } as React.CSSProperties
          }
        >
          <div className="mx-auto flex w-full origin-top justify-center scale-[0.92] sm:scale-100">
            <div className={`grid gap-y-1 sm:gap-y-1.5 ${GRID_TEMPLATE}`}>
              {ultraAllRowSlots.flatMap((rowSlots, rowIndex) =>
                rowSlots.map((slot, slotIndex) =>
                  renderSlot(slot, rowIndex * 100 + slotIndex, selected, toggleSeat),
                ),
              )}
            </div>
          </div>

          <SeatLegend />
        </div>
      </div>

      <BookingSummarySidebar
        pricePerSeat={config.pricePerSeat}
        selectedCount={selected.size}
        total={total}
        selectedSeats={selectedSeats}
        onRemoveSeat={removeById}
        seatTypeLabel={config.label}
      />
    </div>
  );
}
