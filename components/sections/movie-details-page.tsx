import Link from "next/link";
import { eventSchedule } from "@/lib/mock-data/cinema-data";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";

export function MovieDetailsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-12 space-y-10">
      <SectionTitle
        title="HOME ALONG DA RILES"
        subtitle="The ultimate nostalgic comeback. One-night-only reunion screening."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {eventSchedule.map((item) => (
            <HardShadowCard key={item.time} shadow={item.time === "3:00 PM" ? "red" : "black"}>
              <div className="flex items-center justify-between">
                <span className="font-headline text-2xl font-extrabold text-primary">{item.time}</span>
                <span className="font-label text-sm font-bold uppercase">{item.label}</span>
              </div>
            </HardShadowCard>
          ))}
        </div>
        <HardShadowCard shadow="yellow">
          <p className="font-label text-xs uppercase text-outline">Venue</p>
          <h3 className="mt-2 font-headline text-2xl font-extrabold uppercase">Cinema 2 & Ultra Cinema</h3>
          <p className="mt-2">4th Floor Uptown Mall, BGC</p>
          <Link
            href="/seats"
            className="mt-6 inline-flex w-full items-center justify-center rounded border-2 border-black bg-secondary px-5 py-3 text-center font-headline text-sm font-bold uppercase text-white"
          >
            Buy Tickets Now
          </Link>
        </HardShadowCard>
      </div>
    </div>
  );
}
