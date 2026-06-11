"use client";

import { useState, useEffect } from "react";
import type { SeatType } from "@/lib/mock-data/seat-config";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { C2SeatMap } from "@/components/sections/seats/c2-seat-map";
import { UltraSeatMap } from "@/components/sections/seats/ultra-seat-map";
import { apiFetch } from "@/lib/api";

const tabs: SeatType[] = ["c2", "ultra"];

export function SeatTypeTabs() {
  const [activeTab, setActiveTab] = useState<SeatType>("c2");
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border-4 border-secondary bg-surface-variant p-6 text-center text-on-background shadow-[4px_4px_0_0_#1c1b1b]">
        <p className="font-headline text-lg font-bold text-secondary">Error Connection</p>
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

  const c2Cinema = cinemas.find((c) => c.type === "C2");
  const ultraCinema = cinemas.find((c) => c.type === "ULTRA");

  const activePromoCinema = cinemas.find((c) => c.activePromotion);
  const activePromo = activePromoCinema?.activePromotion;

  return (
    <div className="space-y-8">
      {activePromo && (
        <div className="border-4 border-on-background bg-[#ffe16d] p-4 text-[#1c1b1b] shadow-[4px_4px_0_0_#bb0014] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎉</span>
            <div className="text-left">
              <h4 className="font-headline text-base font-black uppercase tracking-wider text-[#bb0014]">
                PROMOTION ACTIVE: {activePromo.name}
              </h4>
              <p className="font-body-md text-sm mt-1">
                Enjoy a special ticket price of <span className="font-black text-[#004e9f]">₱{activePromo.promoPrice.toFixed(2)}</span> (normal price: ₱{activePromoCinema?.defaultPrice?.toFixed(2)}) for <span className="font-bold">{activePromoCinema?.name}</span>!
              </p>
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

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const config = seatTypeConfigs[tab];
          const isActive = activeTab === tab;
          const cinemaObj = tab === "c2" ? c2Cinema : ultraCinema;
          const price = cinemaObj?.currentPrice ?? config.pricePerSeat;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "border-4 px-6 py-3 font-headline text-sm font-extrabold uppercase transition-all select-none cursor-pointer",
                isActive
                  ? "border-on-background bg-secondary text-white shadow-[4px_4px_0_0_#1c1b1b]"
                  : "border-outline bg-background text-on-background hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#1c1b1b] hover:border-on-background active:translate-x-0 active:translate-y-0 active:shadow-none",
              ].join(" ")}
            >
              {config.label}
              <span className="mt-1 block font-label text-[10px] font-bold normal-case opacity-80">
                ₱{price.toFixed(2)} / seat
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded border-2 border-dashed border-outline bg-background/60 p-4">
        <p className="font-label text-xs uppercase text-outline">
          Viewing: <span className="font-bold text-primary">{activeConfig.cinemaLabel}</span>
          <span className="mx-2">•</span>
          {activeConfig.venue}
        </p>
      </div>

      {activeTab === "c2" ? (
        <C2SeatMap cinemaId={c2Cinema?.id} pricePerSeat={c2Cinema?.currentPrice} />
      ) : (
        <UltraSeatMap cinemaId={ultraCinema?.id} pricePerSeat={ultraCinema?.currentPrice} />
      )}
    </div>
  );
}
