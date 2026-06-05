import { eventSchedule } from "@/lib/mock-data/cinema-data";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionTitle } from "@/components/ui/section-title";

export function MovieDetailsPage() {
  return (
    <div className="space-y-10">
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
          <h3 className="mt-2 font-headline text-3xl font-extrabold uppercase">Cinema 2</h3>
          <p className="mt-2">Uptown Mall, BGC</p>
          <PrimaryButton className="mt-6 w-full">Buy Tickets Now</PrimaryButton>
        </HardShadowCard>
      </div>
    </div>
  );
}
