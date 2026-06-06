import { CheckoutPage } from "@/components/sections/checkout-page";
import { Suspense } from "react";

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}
