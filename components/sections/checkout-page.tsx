import { PaymentMethodTabs } from "@/components/sections/payment-method-tabs";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { SectionTitle } from "@/components/ui/section-title";
import { checkoutSummary } from "@/lib/mock-data/cinema-data";

export function CheckoutPage() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Secure Checkout" subtitle="Choose your payment method and complete your booking." />
      <div className="grid gap-6 lg:grid-cols-12">
        <HardShadowCard shadow="black">
          <p className="font-label text-xs uppercase text-outline">Order Summary</p>
          <p className="mt-3">Subtotal: P{checkoutSummary.subtotal.toFixed(2)}</p>
          <p>Service Fee: P{checkoutSummary.serviceFee.toFixed(2)}</p>
          <p className="mt-4 font-headline text-2xl font-extrabold text-secondary">
            Total: P{checkoutSummary.total.toFixed(2)}
          </p>
        </HardShadowCard>
        <div className="lg:col-span-7">
          <HardShadowCard shadow="yellow">
            <PaymentMethodTabs />
          </HardShadowCard>
        </div>
      </div>
    </div>
  );
}
