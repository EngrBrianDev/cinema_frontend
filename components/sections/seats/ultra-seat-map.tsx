"use client";

import { useMemo, useState, useEffect } from "react";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { ultraAllRowSlots, type UltraSeatCell, type UltraSlot } from "@/lib/mock-data/ultra-seat-layout";
import { BookingSummarySidebar } from "@/components/sections/seats/booking-summary-sidebar";
import { SeatLegend } from "@/components/sections/seats/seat-legend";
import { SeatScreen } from "@/components/sections/seats/seat-screen";
import { apiFetch } from "@/lib/api";

const config = seatTypeConfigs.ultra;

const SEAT = "aspect-square w-[var(--u-seat)] h-[var(--u-seat)]";
const SEAT_TEXT = "text-[10px] font-black sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl px-0.5";

/** 20-column grid: extL×2 | gap | 10,9 | aisle | 8,7 | gap | 6,5 | gap | 4,3 | aisle | 2,1 | gap | extR×2 */
const GRID_TEMPLATE =
  "[grid-template-columns:var(--u-seat)_var(--u-seat)_var(--u-gap)_var(--u-seat)_var(--u-seat)_var(--u-aisleL)_var(--u-seat)_var(--u-seat)_var(--u-gap)_var(--u-seat)_var(--u-seat)_var(--u-gap)_var(--u-seat)_var(--u-seat)_var(--u-aisleL)_var(--u-seat)_var(--u-seat)_var(--u-gap)_var(--u-seat)_var(--u-seat)]";

function seatClass(isSelected: boolean, isReserved: boolean): string {
  return [
    `flex aspect-square ${SEAT} select-none items-center justify-center rounded-sm border md:border-2 ${SEAT_TEXT} leading-none transition-all duration-100 px-0.5`,
    isReserved
      ? "cursor-not-allowed border-outline-variant bg-on-background/10 opacity-30 text-outline"
      : isSelected
        ? "seat-pop border-on-background bg-secondary text-white shadow-none md:shadow-[2px_2px_0_0_#1c1b1b] hover:opacity-90"
        : "border-outline bg-surface-variant text-on-background shadow-none md:shadow-[1px_1px_0_0_#1c1b1b] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#1c1b1b] hover:border-on-background active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_#1c1b1b]",
  ].join(" ");
}

const getMobileUltraLabel = (label: string) => {
  return label.replace(/^[A-Z]/, ""); // strip the row label, just show the number (e.g. 10, 9, 1)
};

function UltraSeatButton({
  seat,
  selected,
  isReserved,
  onToggle,
}: {
  seat: UltraSeatCell;
  selected: boolean;
  isReserved: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={isReserved}
      onClick={() => onToggle(seat.key)}
      aria-label={
        isReserved
          ? "Reserved"
          : selected
            ? `Deselect ${seat.label}`
            : `Select ${seat.label}`
      }
      className={seatClass(selected, isReserved)}
    >
      {isReserved ? (
        <>
          <span className="md:hidden text-[6px] font-black text-outline">✕</span>
          <span className="material-symbols-outlined text-outline text-[12px] sm:text-[16px] md:text-[20px] hidden md:inline-block">
            close
          </span>
        </>
      ) : (
        <>
          <span className="md:hidden text-[7px] font-black leading-none">{getMobileUltraLabel(seat.label)}</span>
          <span className="max-w-full px-px hidden md:inline-block">{seat.label}</span>
        </>
      )}
    </button>
  );
}

const ROW_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H"];

function renderSlot(
  slot: UltraSlot,
  index: number,
  selected: string[],
  occupiedSeatNumbers: Set<string>,
  onToggle: (key: string) => void,
) {
  switch (slot.kind) {
    case "blank":
      return <div key={`blank-${index}`} className={SEAT} aria-hidden />;
    case "aisle":
      return (
        <div
          key={`aisle-${index}`}
          className={slot.size === "large" ? "min-w-[var(--u-aisleL)]" : "min-w-[var(--u-gap)]"}
          aria-hidden
        />
      );
    case "seat":
      const isReserved = occupiedSeatNumbers.has(slot.seat.key);
      return (
        <UltraSeatButton
          key={`seat-${index}`}
          seat={slot.seat}
          selected={selected.includes(slot.seat.key)}
          isReserved={isReserved}
          onToggle={onToggle}
        />
      );
  }
}

export function UltraSeatMap({ cinemaId }: { cinemaId: string | undefined }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync quantity with selected seats count on desktop
  useEffect(() => {
    if (!isMobile) {
      setQuantity(selected.length || 1);
    }
  }, [selected, isMobile]);

  const slots = useMemo(() => {
    const arr = Array(quantity).fill("");
    for (let i = 0; i < Math.min(quantity, selected.length); i++) {
      arr[i] = selected[i];
    }
    return arr;
  }, [quantity, selected]);

  const handleSlotChange = (index: number, newSeat: string) => {
    const newSelected = [...selected];
    while (newSelected.length <= index) {
      newSelected.push("");
    }
    if (newSeat === "") {
      newSelected[index] = "";
    } else {
      const existingIndex = newSelected.indexOf(newSeat);
      if (existingIndex !== -1 && existingIndex !== index) {
        newSelected[existingIndex] = "";
      }
      newSelected[index] = newSeat;
    }
    setSelected(newSelected.filter(Boolean));
  };

  useEffect(() => {
    if (!cinemaId) return;

    async function loadSeats() {
      try {
        setLoading(true);
        const data = await apiFetch(`/cinemas/${cinemaId}/seats`);
        setSeats(data);
      } catch (err: any) {
        console.error("Failed to load seats for Ultra Cinema:", err);
        setError(err.message || "Failed to load seating map.");
      } finally {
        setLoading(false);
      }
    }
    loadSeats();
  }, [cinemaId]);

  // Create lookup for occupied seats
  const occupiedSeatNumbers = useMemo(() => {
    return new Set(seats.filter((s) => s.occupied).map((s) => s.seatNumber));
  }, [seats]);

  const getAvailableSeatsInRow = (rowLabel: string, currentSeatValue: string) => {
    const seatsInRow: { seatNumber: string; displayName: string }[] = [];
    for (const rowSlots of ultraAllRowSlots) {
      for (const slot of rowSlots) {
        if (slot.kind === "seat") {
          const seatKey = slot.seat.key;
          const label = slot.seat.label;
          const firstChar = seatKey.charAt(0);
          
          if (firstChar === rowLabel) {
            const isOccupied = occupiedSeatNumbers.has(seatKey);
            const isSelectedByOther = selected.includes(seatKey) && seatKey !== currentSeatValue;
            
            if (!isOccupied && !isSelectedByOther) {
              seatsInRow.push({
                seatNumber: seatKey,
                displayName: `Seat ${label}`,
              });
            }
          }
        }
      }
    }
    return seatsInRow.sort((a, b) => {
      return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const toggleSeat = (seatNumber: string) => {
    if (occupiedSeatNumbers.has(seatNumber)) return;

    if (selected.includes(seatNumber)) {
      setSelected((prev) => prev.filter((sn) => sn !== seatNumber));
    } else {
      if (isMobile) {
        const emptyIndex = slots.indexOf("");
        if (emptyIndex !== -1) {
          handleSlotChange(emptyIndex, seatNumber);
        } else {
          setQuantity((q) => q + 1);
          setSelected((prev) => [...prev, seatNumber]);
        }
      } else {
        setSelected((prev) => [...prev, seatNumber]);
      }
    }
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

    // Map selected seatNumbers to their DB IDs and labels
    return selected.map((key) => {
      const dbSeat = seats.find((s) => s.seatNumber === key);
      return {
        id: dbSeat?.id || key,
        label: labelByKey.get(key) ?? key,
      };
    });
  }, [selected, seats]);

  const total = selected.length * config.pricePerSeat;

  const removeById = (id: string) => {
    const dbSeat = seats.find((s) => s.id === id);
    const key = dbSeat ? dbSeat.seatNumber : id;
    setSelected((prev) => prev.filter((sn) => sn !== key));
  };

  const renderUltraHeader = (type: "standard" | "row-h") => {
    const cols = type === "standard"
      ? {
          extL: ["", ""],
          c10_9: ["10", "9"],
          c8_7: ["8", "7"],
          c6_5: ["6", "5"],
          c4_3: ["4", "3"],
          c2_1: ["2", "1"],
          extR: ["", ""],
        }
      : {
          extL: ["12", "11"],
          c10_9: ["10", "9"],
          c8_7: ["10", "9"],
          c6_5: ["8", "7"],
          c4_3: ["6", "5"],
          c2_1: ["4", "3"],
          extR: ["2", "1"],
        };

    return (
      <div
        className="grid justify-center items-center mb-1 select-none opacity-60 w-full max-w-full"
        style={{
          gridTemplateColumns:
            "var(--u-seat) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-aisleL) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-aisleL) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-seat)",
        }}
      >
        {/* Left Row Label Placeholder */}
        <div />

        {/* Ext L */}
        {cols.extL.map((c, i) => (
          <div key={`extl-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}
        <div /> {/* small gap */}

        {/* 10, 9 */}
        {cols.c10_9.map((c, i) => (
          <div key={`c10_9-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}
        <div /> {/* large aisle */}

        {/* 8, 7 */}
        {cols.c8_7.map((c, i) => (
          <div key={`c8_7-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none animate-fade-in">
            {c}
          </div>
        ))}
        <div /> {/* small gap */}

        {/* 6, 5 */}
        {cols.c6_5.map((c, i) => (
          <div key={`c6_5-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}
        <div /> {/* small gap */}

        {/* 4, 3 */}
        {cols.c4_3.map((c, i) => (
          <div key={`c4_3-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}
        <div /> {/* large aisle */}

        {/* 2, 1 */}
        {cols.c2_1.map((c, i) => (
          <div key={`c2_1-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}
        <div /> {/* small gap */}

        {/* Ext R */}
        {cols.extR.map((c, i) => (
          <div key={`extr-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}

        {/* Right Row Label Placeholder */}
        <div />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border-4 border-secondary bg-surface-variant p-6 text-center text-on-background shadow-[4px_4px_0_0_#1c1b1b]">
        <p className="font-headline text-lg font-bold text-secondary">Seating Error</p>
        <p className="mt-2 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center pb-40">
      <SeatScreen />

      {/* Mobile Quick Seating Selector */}
      <div className="w-full max-w-md mx-auto mb-8 md:hidden border-4 border-on-background bg-surface-variant p-5 shadow-[4px_4px_0_0_#1c1b1b]">
        <h3 className="font-headline text-lg font-black uppercase text-secondary mb-4 flex items-center gap-2 select-none">
          <svg className="w-5 h-5 text-secondary fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v5.17a3 3 0 0 0 0 5.66V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5.17a3 3 0 0 0 0-5.66V4zm2 2v3.17c1.78.89 3 2.72 3 4.83 0 2.11-1.22 3.94-3 4.83V20h12v-3.17a5.002 5.002 0 0 1 0-9.66V6H6zm10 2v2H8V8h8zm0 6v2H8v-2h8z" />
          </svg>
          Quick Ticket Selection
        </h3>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-outline-variant pb-4 mb-4">
          <div>
            <p className="font-headline text-sm font-bold uppercase text-on-background">Number of Tickets</p>
            <p className="font-label text-[10px] text-outline uppercase">Select up to 10 seats</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const nextQ = Math.max(1, quantity - 1);
                setQuantity(nextQ);
                if (selected.length > nextQ) {
                  setSelected(selected.slice(0, nextQ));
                }
              }}
              className="w-10 h-10 border-2 border-on-background bg-background font-black text-lg shadow-[2px_2px_0_0_#1c1b1b] hover:bg-secondary hover:text-white transition-all duration-100 flex items-center justify-center cursor-pointer select-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              －
            </button>
            <span className="font-headline text-xl font-black w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => {
                const nextQ = Math.min(10, quantity + 1);
                setQuantity(nextQ);
              }}
              className="w-10 h-10 border-2 border-on-background bg-background font-black text-lg shadow-[2px_2px_0_0_#1c1b1b] hover:bg-secondary hover:text-white transition-all duration-100 flex items-center justify-center cursor-pointer select-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              ＋
            </button>
          </div>
        </div>

        {/* Dropdowns List */}
        <div className="space-y-4">
          {slots.map((selectedSeat, index) => {
            let currentRowLabel = "";
            let currentSeatCode = "";

            if (selectedSeat) {
              currentRowLabel = selectedSeat.charAt(0);
              currentSeatCode = selectedSeat;
            }

            const availableSeatsInRow = currentRowLabel
              ? getAvailableSeatsInRow(currentRowLabel, selectedSeat)
              : [];

            return (
              <div key={index} className="border-2 border-on-background bg-background p-3 shadow-[2px_2px_0_0_#1c1b1b]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-headline text-xs font-black uppercase text-primary">Ticket #{index + 1}</p>
                  {selectedSeat && (
                    <button
                      type="button"
                      onClick={() => handleSlotChange(index, "")}
                      className="font-label text-[10px] text-secondary font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label text-[10px] uppercase font-bold text-outline mb-1">Row</label>
                    <select
                      value={currentRowLabel}
                      onChange={(e) => {
                        const newRow = e.target.value;
                        if (!newRow) {
                          handleSlotChange(index, "");
                        } else {
                          const avail = getAvailableSeatsInRow(newRow, "");
                          const firstSeat = avail[0] ? avail[0].seatNumber : "";
                          handleSlotChange(index, firstSeat);
                        }
                      }}
                      className="w-full border-2 border-on-background bg-background px-2 py-1.5 font-headline text-xs font-bold focus:outline-none"
                    >
                      <option value="">-- Row --</option>
                      {ROW_ORDER.map((r) => (
                        <option key={r} value={r}>
                          Row {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label text-[10px] uppercase font-bold text-outline mb-1">Seat</label>
                    <select
                      disabled={!currentRowLabel}
                      value={currentSeatCode}
                      onChange={(e) => handleSlotChange(index, e.target.value)}
                      className="w-full border-2 border-on-background bg-background px-2 py-1.5 font-headline text-xs font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Seat --</option>
                      {availableSeatsInRow.map((s) => (
                        <option key={s.seatNumber} value={s.seatNumber}>
                          {s.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="md:hidden font-label text-[10px] uppercase text-outline text-center mb-4 select-none">
        Seating Layout Reference (Tap to select)
      </p>

      <div
        className="railroad-border relative w-full bg-on-background/5 p-2 md:p-8 overflow-x-hidden flex flex-col select-none
                   [--u-seat:3.6vw] [--u-aisleL:4.5vw] [--u-gap:1.2vw]
                   md:[--u-seat:3rem] md:[--u-aisleL:1.7rem] md:[--u-gap:0.45rem]
                   lg:[--u-seat:3.5rem] lg:[--u-aisleL:2rem] lg:[--u-gap:0.55rem]
                   xl:[--u-seat:4rem] xl:[--u-aisleL:2.3rem] xl:[--u-gap:0.65rem]
                   2xl:[--u-seat:4.5rem] 2xl:[--u-aisleL:2.6rem] 2xl:[--u-gap:0.75rem]"
      >
        <div className="flex flex-col items-center w-full max-w-full">
          <div className="flex flex-col gap-1 md:gap-3.5 select-none w-full max-w-full items-center">
            {ultraAllRowSlots.map((rowSlots, rowIndex) => {
              const rowLabel = ROW_ORDER[rowIndex];
              return (
                <div key={rowLabel} className="w-full flex flex-col items-center animate-fade-in">
                  {rowLabel === "A" && renderUltraHeader("standard")}
                  {rowLabel === "H" && renderUltraHeader("row-h")}
                  
                  <div
                    className="grid justify-center items-center w-full max-w-full"
                    style={{
                      gridTemplateColumns:
                        "var(--u-seat) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-aisleL) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-aisleL) var(--u-seat) var(--u-seat) var(--u-gap) var(--u-seat) var(--u-seat) var(--u-seat)",
                    }}
                  >
                    {/* Left Row Label */}
                    <div className="flex aspect-square w-[var(--u-seat)] h-[var(--u-seat)] items-center justify-center font-headline text-[7px] sm:text-xs font-bold text-outline-variant select-none">
                      {rowLabel}
                    </div>

                    {/* 20 slots of row */}
                    {rowSlots.map((slot, slotIndex) =>
                      renderSlot(slot, rowIndex * 100 + slotIndex, selected, occupiedSeatNumbers, toggleSeat)
                    )}

                    {/* Right Row Label */}
                    <div className="flex aspect-square w-[var(--u-seat)] h-[var(--u-seat)] items-center justify-center font-headline text-[7px] sm:text-xs font-bold text-outline-variant select-none">
                      {rowLabel}
                    </div>
                  </div>
                </div>
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
        selectedSeats={selectedSeats}
        onRemoveSeat={removeById}
        seatTypeLabel={config.label}
      />
    </div>
  );
}
