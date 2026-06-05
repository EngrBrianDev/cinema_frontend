import { SeatMap } from "@/components/sections/seat-map";
import { SectionTitle } from "@/components/ui/section-title";

export function SeatSelectionPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        title="Seat Selection"
        subtitle="Select your seats first, then proceed to checkout."
      />
      <SeatMap />
    </div>
  );
}
