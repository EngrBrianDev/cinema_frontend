"use client";

import { useMemo, useState, useEffect } from "react";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { BookingSummarySidebar } from "@/components/sections/seats/booking-summary-sidebar";
import { SeatLegend } from "@/components/sections/seats/seat-legend";
import { SeatScreen } from "@/components/sections/seats/seat-screen";
import { apiFetch } from "@/lib/api";

const config = seatTypeConfigs.c2;

// Row labels in order
const ROW_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q"];

export function C2SeatMap({ cinemaId }: { cinemaId: string | undefined }) {
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
      } catch {
        setError("We couldn't load the seating map right now. Please refresh or try again.");
      } finally {
        setLoading(false);
      }
    }
    loadSeats();
  }, [cinemaId]);

  const toggleSeat = (seatNumber: string) => {
    const dbSeat = seats.find((s) => s.seatNumber === seatNumber);
    if (!dbSeat || dbSeat.occupied) return;

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

  const removeById = (id: string) => {
    const dbSeat = seats.find((s) => s.id === id);
    const seatNumber = dbSeat ? dbSeat.seatNumber : id;
    setSelected((prev) => prev.filter((sn) => sn !== seatNumber));
  };

  const selectedSeats = useMemo(() => {
    return selected.map((sn) => {
      const dbSeat = seats.find((s) => s.seatNumber === sn);
      return {
        id: dbSeat?.id || sn,
        label: sn,
      };
    });
  }, [selected, seats]);

  const total = selected.length * config.pricePerSeat;

  // Group seats by row Label
  const groupedSeats = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const seat of seats) {
      if (!groups[seat.rowLabel]) {
        groups[seat.rowLabel] = [];
      }
      groups[seat.rowLabel].push(seat);
    }
    return groups;
  }, [seats]);

  const getAvailableSeatsInRow = (rowLabel: string, currentSeatValue: string) => {
    const rowSeats = groupedSeats[rowLabel] || [];
    return rowSeats
      .filter((s) => {
        const isSelectedByOther = selected.includes(s.seatNumber) && s.seatNumber !== currentSeatValue;
        return !s.occupied && !isSelectedByOther;
      })
      .map((s) => {
        const displayName = s.seatNumber.includes("PWD")
          ? `PWD Wheelchair (${s.seatNumber.replace("A-", "")})`
          : `Seat ${s.seatNumber}`;
        return {
          seatNumber: s.seatNumber,
          displayName,
        };
      })
      .sort((a, b) => {
        return a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true, sensitivity: 'base' });
      });
  };

  // Map seats into Left, Middle, and Right blocks matching the vertical columns of the PDF
  const getRowBlocks = (rowLabel: string, rowSeats: any[]) => {
    const isRear = ["N", "P", "Q"].includes(rowLabel);

    let leftBlock: any[] = [];
    let middleBlock: any[] = [];
    let rightBlock: any[] = [];

    if (!isRear) {
      // Rows A-M (Left Block: Col 17, 16 - with 2 leading empty spaces)
      const col17 = rowSeats.find((s) => s.seatNumber === `${rowLabel}17`);
      const col16 = rowSeats.find((s) => s.seatNumber === `${rowLabel}16`);
      leftBlock = [null, null, col17, col16];

      // Rows A-M (Middle Block: Col 15 down to 3)
      for (let col = 15; col >= 3; col--) {
        const seat = rowSeats.find((s) => s.seatNumber === `${rowLabel}${col}`);
        middleBlock.push(seat || null);
      }

      // Rows A-M (Right Block: Col 2 and 1 - with 3 trailing empty spaces)
      let col2, col1;
      if (rowLabel === "A") {
        col2 = rowSeats.find((s) => s.seatNumber === "A-PWD1");
        col1 = rowSeats.find((s) => s.seatNumber === "A-PWD2");
      } else {
        col2 = rowSeats.find((s) => s.seatNumber === `${rowLabel}2`);
        col1 = rowSeats.find((s) => s.seatNumber === `${rowLabel}1`);
      }
      rightBlock = [col2, col1, null, null, null];
    } else {
      // Rows N-Q (Left Block: Col 22 down to 19)
      for (let col = 22; col >= 19; col--) {
        const seat = rowSeats.find((s) => s.seatNumber === `${rowLabel}${col}`);
        leftBlock.push(seat || null);
      }

      // Rows N-Q (Middle Block: Col 18 down to 6)
      for (let col = 18; col >= 6; col--) {
        const seat = rowSeats.find((s) => s.seatNumber === `${rowLabel}${col}`);
        middleBlock.push(seat || null);
      }

      // Rows N-Q (Right Block: Col 5 down to 1)
      for (let col = 5; col >= 1; col--) {
        const seat = rowSeats.find((s) => s.seatNumber === `${rowLabel}${col}`);
        rightBlock.push(seat || null);
      }
    }

    return { leftBlock, middleBlock, rightBlock };
  };

  const getMobileSeatLabel = (seatNumber: string) => {
    if (seatNumber.includes("PWD")) return "P";
    return seatNumber.replace(/^[A-Z]/, ""); // strip the row label, just show the number (e.g. 17, 16, 1)
  };

  const renderSeatOrBlank = (seat: any, key: string) => {
    if (!seat) {
      return (
        <div
          key={key}
          className="aspect-square w-[var(--c2-seat)] h-[var(--c2-seat)]"
          aria-hidden="true"
        />
      );
    }

    const isOccupied = seat.occupied;
    const isSelected = selected.includes(seat.seatNumber);
    const isPwd = seat.seatNumber.includes("PWD");

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isOccupied}
        onClick={() => toggleSeat(seat.seatNumber)}
        aria-label={
          isOccupied
            ? "Reserved"
            : isSelected
              ? `Deselect ${seat.seatNumber}`
              : `Select ${seat.seatNumber}`
        }
        className={[
          "flex aspect-square w-[var(--c2-seat)] h-[var(--c2-seat)] select-none items-center justify-center rounded-sm border md:border-2 text-[10px] font-black leading-none transition-all duration-100 sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl px-0.5",
          isOccupied
            ? "cursor-not-allowed border-outline-variant bg-on-background/10 opacity-30 text-outline"
            : isSelected
              ? "seat-pop border-on-background bg-secondary text-white shadow-none md:shadow-[2px_2px_0_0_#1c1b1b] hover:opacity-90"
              : isPwd
                ? "border-primary bg-primary/20 text-primary shadow-none md:shadow-[1px_1px_0_0_#004e9f] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#004e9f] hover:border-primary active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_#004e9f]"
                : "border-outline bg-surface-variant text-on-background shadow-none md:shadow-[1px_1px_0_0_#1c1b1b] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#1c1b1b] hover:border-on-background active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_#1c1b1b]",
        ].join(" ")}
      >
        {isOccupied ? (
          <span className="text-outline text-[7px] md:text-base font-black">✕</span>
        ) : isPwd ? (
          <>
            <span className="md:hidden text-[7px] font-black">P</span>
            <span className="font-black text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base 2xl:text-lg hidden md:inline-block">PWD</span>
          </>
        ) : (
          <>
            <span className="md:hidden text-[7px] font-black leading-none">{getMobileSeatLabel(seat.seatNumber)}</span>
            <span className="hidden md:inline-block">{seat.seatNumber}</span>
          </>
        )}
      </button>
    );
  };

  const renderC2Header = (type: "A-M" | "N-Q") => {
    const cols = type === "A-M"
      ? {
          left: ["", "", "17", "16"],
          middle: ["15", "14", "13", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3"],
          right: ["2", "1", "", "", ""]
        }
      : {
          left: ["22", "21", "20", "19"],
          middle: ["18", "17", "16", "15", "14", "13", "12", "11", "10", "9", "8", "7", "6"],
          right: ["5", "4", "3", "2", "1"]
        };

    return (
      <div
        className="grid gap-x-[1px] md:gap-x-3.5 justify-center items-center mb-1 select-none opacity-60 w-full max-w-full"
        style={{
          gridTemplateColumns:
            "var(--c2-seat) repeat(4, var(--c2-seat)) var(--c2-aisle) repeat(13, var(--c2-seat)) var(--c2-aisle) repeat(5, var(--c2-seat)) var(--c2-seat)",
        }}
      >
        {/* Left Row Label Placeholder */}
        <div />

        {/* Left Block */}
        {cols.left.map((c, i) => (
          <div key={`left-h-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
            {c}
          </div>
        ))}

        {/* Left Aisle */}
        <div />

        {/* Middle Block */}
        {cols.middle.map((c, i) => (
          <div key={`mid-h-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none animate-fade-in">
            {c}
          </div>
        ))}

        {/* Right Aisle */}
        <div />

        {/* Right Block */}
        {cols.right.map((c, i) => (
          <div key={`right-h-${i}`} className="text-center font-headline text-[7px] sm:text-[10px] md:text-xs font-bold text-outline select-none">
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
      <div className="flex h-16 items-center justify-center sm:h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border-4 border-secondary bg-surface-variant p-6 text-center text-on-background shadow-[4px_4px_0_0_#1c1b1b]">
        <p className="font-headline text-lg font-bold text-secondary">Seating Error</p>
        <p className="mt-2 text-sm opacity-80">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 border-4 border-on-background bg-secondary px-5 py-2 font-headline text-xs font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
        >
          Retry
        </button>
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
              if (selectedSeat.startsWith("A-PWD")) {
                currentRowLabel = "A";
                currentSeatCode = selectedSeat;
              } else {
                currentRowLabel = selectedSeat.charAt(0);
                currentSeatCode = selectedSeat;
              }
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
                      value={currentRowLabel || ""}
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
                      value={currentSeatCode || ""}
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
                   [--c2-seat:2.8vw] [--c2-aisle:3.6vw]
                   md:[--c2-seat:2.6rem] md:[--c2-aisle:1.6rem]
                   lg:[--c2-seat:3rem] lg:[--c2-aisle:1.9rem]
                   xl:[--c2-seat:3.5rem] xl:[--c2-aisle:2.2rem]
                   2xl:[--c2-seat:4rem] 2xl:[--c2-aisle:2.5rem]"
      >
        <div className="flex flex-col items-center w-full max-w-full">
          {/* Seating Area Grid Container */}
          <div className="flex flex-col gap-1 md:gap-3.5 select-none w-full max-w-full items-center">
            {ROW_ORDER.map((rowLabel) => {
              const rowSeats = groupedSeats[rowLabel] || [];
              if (rowSeats.length === 0) return null;

              const { leftBlock, middleBlock, rightBlock } = getRowBlocks(rowLabel, rowSeats);

              return (
                <div key={rowLabel} className="w-full flex flex-col items-center">
                  {rowLabel === "A" && renderC2Header("A-M")}
                  {rowLabel === "N" && renderC2Header("N-Q")}

                  <div
                    className="grid gap-x-[1px] md:gap-x-3.5 justify-center items-center w-full max-w-full"
                    style={{
                      gridTemplateColumns:
                        "var(--c2-seat) repeat(4, var(--c2-seat)) var(--c2-aisle) repeat(13, var(--c2-seat)) var(--c2-aisle) repeat(5, var(--c2-seat)) var(--c2-seat)",
                    }}
                  >
                    {/* Left Row Label */}
                    <div className="flex aspect-square w-[var(--c2-seat)] h-[var(--c2-seat)] items-center justify-center font-headline text-[7px] sm:text-xs font-bold text-outline-variant select-none">
                      {rowLabel}
                    </div>

                    {/* Left Block (4 columns) */}
                    {leftBlock.map((seat, index) =>
                      renderSeatOrBlank(seat, `left-${rowLabel}-${index}`)
                    )}

                    {/* Left Aisle */}
                    <div className="w-full" aria-hidden />

                    {/* Middle Block (13 columns) */}
                    {middleBlock.map((seat, index) =>
                      renderSeatOrBlank(seat, `middle-${rowLabel}-${index}`)
                    )}

                    {/* Right Aisle */}
                    <div className="w-full" aria-hidden />

                    {/* Right Block (5 columns) */}
                    {rightBlock.map((seat, index) =>
                      renderSeatOrBlank(seat, `right-${rowLabel}-${index}`)
                    )}

                    {/* Right Row Label */}
                    <div className="flex aspect-square w-[var(--c2-seat)] h-[var(--c2-seat)] items-center justify-center font-headline text-[7px] sm:text-xs font-bold text-outline-variant select-none">
                      {rowLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <SeatLegend showPwd />
        </div>
      </div>

      <BookingSummarySidebar
        pricePerSeat={config.pricePerSeat}
        selectedCount={selected.length}
        total={total}
        selectedSeats={selectedSeats}
        onRemoveSeat={removeById}
        seatTypeLabel={config.label}
        cinemaId={cinemaId}
      />
    </div>
  );
}
