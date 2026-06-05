"use client";

import { useState } from "react";
import type { SeatType } from "@/lib/mock-data/seat-config";
import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { C2SeatMap } from "@/components/sections/seats/c2-seat-map";
import { UltraSeatMap } from "@/components/sections/seats/ultra-seat-map";

const tabs: SeatType[] = ["c2", "ultra"];

export function SeatTypeTabs() {
  const [activeTab, setActiveTab] = useState<SeatType>("c2");
  const activeConfig = seatTypeConfigs[activeTab];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const config = seatTypeConfigs[tab];
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "border-4 px-6 py-3 font-headline text-sm font-extrabold uppercase transition-all",
                isActive
                  ? "border-on-background bg-secondary text-white shadow-[4px_4px_0_0_#1c1b1b]"
                  : "border-outline bg-background text-on-background hover:border-secondary",
              ].join(" ")}
            >
              {config.label}
              <span className="mt-1 block font-label text-[10px] font-bold normal-case opacity-80">
                ₱{config.pricePerSeat.toFixed(2)} / seat
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

      {activeTab === "c2" ? <C2SeatMap /> : <UltraSeatMap />}
    </div>
  );
}
