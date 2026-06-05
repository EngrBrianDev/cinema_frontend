"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";

const methods = ["gcash", "maya", "card"] as const;
type Method = (typeof methods)[number];

export function PaymentMethodTabs() {
  const [method, setMethod] = useState<Method>("gcash");

  return (
    <div className="space-y-6">
      <div className="grid gap-2 md:grid-cols-3">
        {methods.map((item) => (
          <button
            key={item}
            onClick={() => setMethod(item)}
            className={`rounded border-2 border-black p-3 font-label text-xs font-bold uppercase ${
              method === item ? "bg-secondary text-white" : "bg-surface-variant"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {method === "card" ? (
        <div className="space-y-3">
          <input className="w-full rounded border-2 border-black p-3" placeholder="Cardholder Name" />
          <input className="w-full rounded border-2 border-black p-3" placeholder="Card Number" />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded border-2 border-black p-3" placeholder="MM/YY" />
            <input className="rounded border-2 border-black p-3" placeholder="CVV" />
          </div>
        </div>
      ) : (
        <div className="rounded border-2 border-dashed border-outline bg-surface-variant p-10 text-center">
          <p className="font-body-md">Scan QR with your {method.toUpperCase()} app to continue payment.</p>
        </div>
      )}

      <PrimaryButton className="w-full">Complete Payment</PrimaryButton>
    </div>
  );
}
