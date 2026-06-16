"use client";

import { useState, useEffect } from "react";
import type { SeatType } from "@/lib/mock-data/seat-config";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { C2SeatMap } from "@/components/sections/seats/c2-seat-map";
import { UltraSeatMap } from "@/components/sections/seats/ultra-seat-map";
import { BookingSummarySidebar, SelectedSeatChip } from "@/components/sections/seats/booking-summary-sidebar";
import { apiFetch } from "@/lib/api";

const tabs: SeatType[] = ["c2", "ultra"];

export function SeatTypeTabs() {
  const [activeTab, setActiveTab] = useState<SeatType>("c2");
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lifted selection states for C2 and Ultra
  const [selectedC2, setSelectedC2] = useState<string[]>([]);
  const [selectedUltra, setSelectedUltra] = useState<string[]>([]);

  // Selection chips reported by child components
  const [c2SelectedSeatsChips, setC2SelectedSeatsChips] = useState<SelectedSeatChip[]>([]);
  const [ultraSelectedSeatsChips, setUltraSelectedSeatsChips] = useState<SelectedSeatChip[]>([]);

  useEffect(() => {
    async function loadCinemas() {
      try {
        const data = await apiFetch("/cinemas");
        setCinemas(data);
      } catch {
        setError("We couldn't load the cinema data right now. Please refresh or try again.");
      } finally {
        setLoading(false);
      }
    }
    loadCinemas();
  }, []);

  const activeConfig = seatTypeConfigs[activeTab];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <div className="motion-card w-full max-w-lg rounded border-2 border-black bg-white p-6">
          <div className="motion-loading skeleton-block h-8 w-1/3" />
          <div className="motion-loading skeleton-block mt-4 h-4 w-full" />
          <div className="motion-loading skeleton-block mt-3 h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="motion-error rounded-sm border-4 border-secondary bg-surface-variant p-6 text-center text-on-background shadow-[4px_4px_0_0_#1c1b1b]">
        <p className="font-headline text-lg font-bold text-secondary">Error Connection</p>
        <p className="mt-2 text-sm opacity-80">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="motion-button mt-4 border-4 border-on-background bg-secondary px-5 py-2 font-headline text-xs font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
        >
          Retry
        </button>
      </div>
    );
  }

  const c2Cinema = cinemas.find((c) => c.type === "C2");
  const ultraCinema = cinemas.find((c) => c.type === "ULTRA");

  const activePromoCinema = cinemas.find((c) => c.activePromotion);
  const activePromo = activePromoCinema?.activePromotion;

  // Combined ticket count across standard/VIP and Cinema 2/Ultra Cinema
  const globalCount = selectedC2.length + selectedUltra.length;

  const c2Promo = c2Cinema?.activePromotion;
  let c2Price = c2Cinema?.currentPrice ?? 800;
  if (c2Promo && c2Promo.name === "Fathers Day Super Sale Promotion") {
    c2Price = globalCount >= 2 ? Number(c2Promo.promoPrice) : 800;
  }

  const ultraPromo = ultraCinema?.activePromotion;
  let ultraPrice = ultraCinema?.currentPrice ?? 1000;
  if (ultraPromo && ultraPromo.name === "Fathers Day Super Sale Promotion") {
    ultraPrice = globalCount >= 2 ? Number(ultraPromo.promoPrice) : 1000;
  }

  const c2Total = selectedC2.length * c2Price;
  const ultraTotal = selectedUltra.length * ultraPrice;
  const globalTotal = c2Total + ultraTotal;

  // Combine reported chips and enrich with the globally evaluated price
  const combinedSelectedSeatsChips: SelectedSeatChip[] = [
    ...c2SelectedSeatsChips.map((chip) => ({
      ...chip,
      price: c2Price,
    })),
    ...ultraSelectedSeatsChips.map((chip) => ({
      ...chip,
      price: ultraPrice,
    })),
  ];

  const handleRemoveSeat = (id: string) => {
    const c2Chip = c2SelectedSeatsChips.find((s) => s.id === id);
    if (c2Chip) {
      setSelectedC2((prev) => prev.filter((sn) => sn !== c2Chip.label));
      return;
    }
    const ultraChip = ultraSelectedSeatsChips.find((s) => s.id === id);
    if (ultraChip) {
      setSelectedUltra((prev) => prev.filter((sn) => sn !== ultraChip.label));
      return;
    }
  };

  return (
    <div className="motion-panel space-y-8">
      {activePromo && (
        <div className="border-4 border-on-background bg-[#ffe16d] p-4 text-[#1c1b1b] shadow-[4px_4px_0_0_#bb0014] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎉</span>
            <div className="text-left">
              <h4 className="font-headline text-base font-black uppercase tracking-wider text-[#bb0014]">
                PROMOTION ACTIVE: {activePromo.name}
              </h4>
              {activePromo.name === "Fathers Day Super Sale Promotion" ? (
                <p className="font-body-md text-sm mt-1">
                  Buy <span className="font-bold">2 or more tickets (mixed or same type)</span> to enjoy a special price of <span className="font-black text-[#004e9f]">₱550.00</span> for <span className="font-bold">Cinema 2</span> and <span className="font-black text-[#004e9f]">₱750.00</span> for <span className="font-bold">Ultra Cinema</span>!
                </p>
              ) : (
                <p className="font-body-md text-sm mt-1">
                  Enjoy a special ticket price of <span className="font-black text-[#004e9f]">₱{activePromo.promoPrice.toFixed(2)}</span> (normal price: ₱{activePromoCinema?.defaultPrice?.toFixed(2)}) for <span className="font-bold">{activePromoCinema?.name}</span>!
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0 border-2 border-on-background bg-white px-3 py-1.5 font-label text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_0_#1c1b1b]">
            ⏰ Ends at {new Date(activePromo.endTime).toLocaleTimeString("en-PH", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Manila",
            }) + " PHT"}
          </div>
        </div>
      )}

      <div className="motion-stagger flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const config = seatTypeConfigs[tab];
          const isActive = activeTab === tab;
          const cinemaObj = tab === "c2" ? c2Cinema : ultraCinema;
          
          let price = cinemaObj?.currentPrice ?? config.pricePerSeat;
          const isFathersDay = cinemaObj?.activePromotion?.name === "Fathers Day Super Sale Promotion";
          
          const subLabel = isFathersDay
            ? `₱${price.toFixed(2)} / seat (min. 2 seats)`
            : `₱${price.toFixed(2)} / seat`;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "motion-button border-4 px-6 py-3 font-headline text-sm font-extrabold uppercase transition-all select-none cursor-pointer",
                isActive
                  ? "border-on-background bg-secondary text-white shadow-[4px_4px_0_0_#1c1b1b]"
                  : "border-outline bg-background text-on-background hover:shadow-[3px_3px_0_0_#1c1b1b] hover:border-on-background active:shadow-none",
              ].join(" ")}
            >
              {config.label}
              <span className="mt-1 block font-label text-[10px] font-bold normal-case opacity-80">
                {subLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="motion-panel rounded border-2 border-dashed border-outline bg-background/60 p-4">
        <p className="font-label text-xs uppercase text-outline">
          Viewing: <span className="font-bold text-primary">{activeConfig.cinemaLabel}</span>
          <span className="mx-2">•</span>
          {activeConfig.venue}
        </p>
      </div>

      {activeTab === "c2" ? (
        <div key="c2" className="motion-tab-content">
          <C2SeatMap
            cinemaId={c2Cinema?.id}
            pricePerSeat={c2Cinema?.currentPrice}
            selected={selectedC2}
            setSelected={setSelectedC2}
            activePromotion={c2Cinema?.activePromotion}
            totalTicketsCount={globalCount}
            onSelectedSeatsChange={setC2SelectedSeatsChips}
            hideSidebar={true}
          />
        </div>
      ) : (
        <div key="ultra" className="motion-tab-content">
          <UltraSeatMap
            cinemaId={ultraCinema?.id}
            pricePerSeat={ultraCinema?.currentPrice}
            selected={selectedUltra}
            setSelected={setSelectedUltra}
            activePromotion={ultraCinema?.activePromotion}
            totalTicketsCount={globalCount}
            onSelectedSeatsChange={setUltraSelectedSeatsChips}
            hideSidebar={true}
          />
        </div>
      )}

      {globalCount > 0 && (
        <BookingSummarySidebar
          pricePerSeat={activeTab === "c2" ? c2Price : ultraPrice}
          selectedCount={globalCount}
          total={globalTotal}
          selectedSeats={combinedSelectedSeatsChips}
          onRemoveSeat={handleRemoveSeat}
          seatTypeLabel={
            selectedC2.length > 0 && selectedUltra.length > 0
              ? "Cinema 2 & Ultra Cinema"
              : selectedC2.length > 0
              ? "Cinema 2"
              : "Ultra Cinema"
          }
          cinemaId={
            selectedC2.length > 0 && selectedUltra.length > 0
              ? c2Cinema?.id
              : selectedC2.length > 0
              ? c2Cinema?.id
              : ultraCinema?.id
          }
        />
      )}
    </div>
  );
}
