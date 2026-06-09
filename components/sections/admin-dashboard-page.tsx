import { BuyersTable } from "@/components/sections/buyers-table";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";

export function AdminDashboardPage() {
  return (
    <div className="motion-panel space-y-6">
      <div className="motion-stagger grid gap-4 md:grid-cols-3">
        <HardShadowCard shadow="black">
          <p className="font-label text-xs uppercase text-outline">Total Sales</p>
          <p className="mt-2 font-headline text-4xl font-extrabold text-primary">P452,300</p>
        </HardShadowCard>
        <HardShadowCard shadow="red">
          <p className="font-label text-xs uppercase text-outline">Tickets Sold</p>
          <p className="mt-2 font-headline text-4xl font-extrabold text-secondary">1,248</p>
        </HardShadowCard>
        <HardShadowCard shadow="yellow">
          <p className="font-label text-xs uppercase text-outline">Remaining Seats</p>
          <p className="mt-2 font-headline text-4xl font-extrabold text-tertiary">152</p>
        </HardShadowCard>
      </div>
      <BuyersTable />
    </div>
  );
}
