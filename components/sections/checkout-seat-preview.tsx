"use client";

import { ultraAllRowSlots } from "@/lib/mock-data/ultra-seat-layout";

const C2_ROW_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q"];
const ULTRA_ROW_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H"];

const C2_GRID_TEMPLATE =
  "var(--preview-seat) repeat(4, var(--preview-seat)) var(--preview-aisle) repeat(13, var(--preview-seat)) var(--preview-aisle) repeat(5, var(--preview-seat)) var(--preview-seat)";

const ULTRA_GRID_TEMPLATE =
  "var(--preview-seat) var(--preview-seat) var(--preview-seat) var(--preview-gap) var(--preview-seat) var(--preview-seat) var(--preview-aisle) var(--preview-seat) var(--preview-seat) var(--preview-gap) var(--preview-seat) var(--preview-seat) var(--preview-gap) var(--preview-seat) var(--preview-seat) var(--preview-aisle) var(--preview-seat) var(--preview-seat) var(--preview-gap) var(--preview-seat) var(--preview-seat) var(--preview-seat)";

interface CheckoutSeatPreviewProps {
  selectedSeats: string[];
  seatTypeLabel: string;
}

function normalizeSeatLabel(value: string) {
  return value.trim().toUpperCase();
}

function ScreenPreview() {
  return (
    <div className="mb-4 flex flex-col items-center">
      <div className="h-1.5 w-40 max-w-full rounded-full bg-on-background/40 shadow-[0_1px_0_0_#1c1b1b]" />
      <p className="mt-2 font-label text-[8px] uppercase tracking-[0.45em] text-outline">Screen</p>
    </div>
  );
}

function SeatDot({
  seatNumber,
  selectedSet,
}: {
  seatNumber: string | null;
  selectedSet: Set<string>;
}) {
  if (!seatNumber) {
    return <div className="aspect-square w-[var(--preview-seat)]" aria-hidden="true" />;
  }

  const isSelected = selectedSet.has(normalizeSeatLabel(seatNumber));

  return (
    <div
      aria-label={isSelected ? `Selected seat ${seatNumber}` : "Available seat"}
      className={[
        "aspect-square w-[var(--preview-seat)] rounded-[2px] border",
        isSelected
          ? "border-on-background bg-secondary shadow-[1px_1px_0_0_#1c1b1b]"
          : "border-outline bg-surface-variant",
      ].join(" ")}
    />
  );
}

function getC2RowBlocks(rowLabel: string) {
  const isRear = ["N", "P", "Q"].includes(rowLabel);
  const leftBlock: (string | null)[] = [];
  const middleBlock: (string | null)[] = [];
  const rightBlock: (string | null)[] = [];

  if (!isRear) {
    leftBlock.push(null, null, `${rowLabel}17`, `${rowLabel}16`);

    for (let col = 15; col >= 3; col--) {
      middleBlock.push(`${rowLabel}${col}`);
    }

    rightBlock.push(
      rowLabel === "A" ? "A-PWD1" : `${rowLabel}2`,
      rowLabel === "A" ? "A-PWD2" : `${rowLabel}1`,
      null,
      null,
      null,
    );
  } else {
    for (let col = 22; col >= 19; col--) {
      leftBlock.push(`${rowLabel}${col}`);
    }

    for (let col = 18; col >= 6; col--) {
      middleBlock.push(`${rowLabel}${col}`);
    }

    for (let col = 5; col >= 1; col--) {
      rightBlock.push(`${rowLabel}${col}`);
    }
  }

  return { leftBlock, middleBlock, rightBlock };
}

function C2Preview({ selectedSet }: { selectedSet: Set<string> }) {
  return (
    <div
      className="overflow-x-auto pb-1 [--preview-seat:0.52rem] [--preview-aisle:0.52rem] sm:[--preview-seat:0.62rem] sm:[--preview-aisle:0.7rem]"
      aria-label="C2 seat map preview"
    >
      <div className="min-w-max">
        <ScreenPreview />
        <div className="flex flex-col gap-1">
          {C2_ROW_ORDER.map((rowLabel) => {
            const { leftBlock, middleBlock, rightBlock } = getC2RowBlocks(rowLabel);

            return (
              <div
                key={rowLabel}
                className="grid items-center justify-center gap-x-1"
                style={{ gridTemplateColumns: C2_GRID_TEMPLATE }}
              >
                <div aria-hidden />
                {leftBlock.map((seat, index) => (
                  <SeatDot key={`left-${rowLabel}-${index}`} seatNumber={seat} selectedSet={selectedSet} />
                ))}
                <div aria-hidden />
                {middleBlock.map((seat, index) => (
                  <SeatDot key={`middle-${rowLabel}-${index}`} seatNumber={seat} selectedSet={selectedSet} />
                ))}
                <div aria-hidden />
                {rightBlock.map((seat, index) => (
                  <SeatDot key={`right-${rowLabel}-${index}`} seatNumber={seat} selectedSet={selectedSet} />
                ))}
                <div aria-hidden />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UltraPreview({ selectedSet }: { selectedSet: Set<string> }) {
  return (
    <div
      className="overflow-x-auto pb-1 [--preview-seat:0.7rem] [--preview-gap:0.24rem] [--preview-aisle:0.7rem] sm:[--preview-seat:0.82rem] sm:[--preview-gap:0.3rem] sm:[--preview-aisle:0.86rem]"
      aria-label="Ultra seat map preview"
    >
      <div className="min-w-max">
        <ScreenPreview />
        <div className="flex flex-col gap-1.5">
          {ultraAllRowSlots.map((rowSlots, rowIndex) => {
            const rowLabel = ULTRA_ROW_ORDER[rowIndex];

            return (
              <div
                key={rowLabel}
                className="grid items-center justify-center"
                style={{ gridTemplateColumns: ULTRA_GRID_TEMPLATE }}
              >
                <div aria-hidden />
                {rowSlots.map((slot, slotIndex) => {
                  if (slot.kind === "seat") {
                    return (
                      <SeatDot
                        key={`${rowLabel}-${slotIndex}`}
                        seatNumber={slot.seat.label}
                        selectedSet={selectedSet}
                      />
                    );
                  }

                  return <div key={`${rowLabel}-${slotIndex}`} aria-hidden />;
                })}
                <div aria-hidden />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CheckoutSeatPreview({ selectedSeats, seatTypeLabel }: CheckoutSeatPreviewProps) {
  const selectedSet = new Set(selectedSeats.map(normalizeSeatLabel));
  const isUltra = seatTypeLabel.toLowerCase().includes("ultra");

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-label text-xs uppercase text-outline">Seat Preview</p>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[2px] border border-on-background bg-secondary shadow-[1px_1px_0_0_#1c1b1b]" />
          <span className="font-label text-[9px] font-bold uppercase text-outline">Selected</span>
        </div>
      </div>
      {isUltra ? <UltraPreview selectedSet={selectedSet} /> : <C2Preview selectedSet={selectedSet} />}
    </div>
  );
}
