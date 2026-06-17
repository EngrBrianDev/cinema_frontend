"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  savePendingPaymongoReservationIds,
  savePendingPaymongoSessionId,
  releasePendingPaymongoReservations,
} from "@/lib/checkout-reservations";
import { useAuth } from "@/context/auth-context";


type CheckoutSummary = {
  paymentMethod?: string;
  seatIds: string[];
  selectedSeats: string[];
  cinemaId: string;
  total: number;
  seatTypeLabel?: string;
  seats?: {
    id: string;
    seatNumber?: string;
    label: string;
    cinemaId: string;
    price: number;
  }[];
};

type ReservationResult = {
  id: string;
};

function readCheckoutSummary(): CheckoutSummary | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("checkout_summary");
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as CheckoutSummary;
  } catch (e: unknown) {
    console.error("Failed to parse checkout summary:", e);
    return null;
  }
}


export function PaymentMethodTabs() {
  const [summary] = useState<CheckoutSummary | null>(() => readCheckoutSummary());
  const router = useRouter();
  const { user } = useAuth();

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const handlePayment = async () => {
    if (!summary) {
      setError("No booking summary found. Please select seats first.");
      return;
    }
    if (!user) {
      setError("Please sign in to proceed with your booking.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const createdReservationIds: string[] = [];

    try {
      // Step 1: Create reservations sequentially so partial holds can be released on failure.
      const reservationResults: ReservationResult[] = [];
      const seats = summary.seats || [];
      const totalTicketsCount = seats.length > 0 ? seats.length : summary.seatIds.length;

      for (let idx = 0; idx < totalTicketsCount; idx++) {
        const seat = seats[idx];
        const dbSeatNumber = seat ? (seat.seatNumber || seat.label) : summary.selectedSeats[idx];
        const cinemaId = seat ? seat.cinemaId : summary.cinemaId;

        const reservation = await apiFetch("/reservations", {
          method: "POST",
          body: {
            cinemaId,
            seatNumber: dbSeatNumber,
            totalTicketsCount,
          },
        }) as ReservationResult;
        reservationResults.push(reservation);
        createdReservationIds.push(reservation.id);
      }

      const resIds = reservationResults.map((r) => r.id);

      // Step 2: Charge / Redirect to gateway
      const result = await apiFetch("/payments/paymongo/create-session", {
        method: "POST",
        body: {
          reservationIds: resIds,
        },
      }) as { checkoutSessionId: string; checkoutUrl: string };

      if (result.checkoutUrl) {
        try {
          const checkoutUrlObj = new URL(result.checkoutUrl);
          const isValidPaymongo = checkoutUrlObj.protocol === 'https:' &&
            (checkoutUrlObj.hostname.endsWith('.paymongo.com') || checkoutUrlObj.hostname === 'paymongo.com');
          if (!isValidPaymongo) {
            throw new Error("Invalid payment gateway URL detected. Aborting for your safety.");
          }
        } catch (urlErr: unknown) {
          if (urlErr instanceof Error && urlErr.message.includes("Invalid payment")) throw urlErr;
          throw new Error("Invalid checkout link received from payment gateway.");
        }
        savePendingPaymongoReservationIds(resIds);
        savePendingPaymongoSessionId(result.checkoutSessionId);
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Failed to retrieve PayMongo checkout link from the payment gateway.");
      }
    } catch (err: unknown) {
      if (createdReservationIds.length > 0) {
        try {
          await apiFetch("/reservations/cancel", {
            method: "POST",
            body: { reservationIds: createdReservationIds },
          });
        } catch (releaseErr) {
          console.error("Failed to release pending reservations after payment error:", releaseErr);
        }
      }
      console.error("Payment submission failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelModalOpen(false);
    try {
      await releasePendingPaymongoReservations();
    } catch (err) {
      console.error("Failed to release pending PayMongo reservations:", err);
    }
    localStorage.removeItem("checkout_summary");
    sessionStorage.removeItem("checkout_entry_allowed");
    router.push("/seats");
  };

  const totalAmount = summary ? summary.total : 0;

  return (
    <div className="motion-panel space-y-6">
      {error && (
        <div className="motion-error border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {error}
        </div>
      )}

      {/* Payment details content */}
      <div className="border-4 border-on-background bg-background p-6 shadow-[4px_4px_0_0_#1c1b1b]">
        <div className="space-y-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* PayMongo Details */}
          {(() => {
            const isUltra = summary?.seatTypeLabel?.toLowerCase().includes("ultra") || false;
            const logoSrc = isUltra ? "/image/ultra_paymongo_logo.png" : "/image/cinema_2_paymongo_logo.png";
            const cinemaName = isUltra ? "ULTRA SCREEN" : "CINEMA 2";
            const ticketCount = summary ? summary.seatIds.length : 1;
            const pricePerTicket = summary ? (summary.total / ticketCount) : (isUltra ? 1000 : 800);

            return (
              <>
                <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-label text-xs uppercase font-extrabold text-secondary">
                      Pay via QR Ph
                    </span>
                    <div className="border-4 border-on-background p-1 bg-white shadow-[3px_3px_0_0_#1c1b1b] w-40 h-40">
                      <img
                        src={logoSrc}
                        alt={`${cinemaName} Ticket Logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-[280px]">
                    <p className="font-headline text-xs font-bold text-on-background">
                      {cinemaName} ({ticketCount} {ticketCount > 1 ? "Seats" : "Seat"})
                    </p>
                    <p className="font-body-sm text-[11px] text-outline leading-tight">
                      Price per seat: <strong>₱{pricePerTicket.toLocaleString()}</strong><br />
                      Total to Pay: <strong className="text-secondary">₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col space-y-4 justify-center self-stretch border-t md:border-t-0 md:border-l border-on-background/10 pt-6 md:pt-0 md:pl-6">
                  <h3 className="font-headline text-base font-black uppercase text-secondary">
                    Secure QR Ph Payment
                  </h3>
                  <p className="font-body-md text-xs text-outline leading-relaxed">
                    You will be securely redirected to PayMongo to complete your purchase.
                  </p>
                  <ul className="space-y-2 text-xs font-body-md text-on-background">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">⚡</span>
                      <span>
                        <strong>No manual receipt upload required</strong>. The system automatically confirms your seats upon successful payment.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">🥤</span>
                      <span>
                        Includes: <strong>{isUltra ? "1 Recliner Chair" : "1 Regular Seat"}</strong>, free soda, free popcorn, and free water.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">📧</span>
                      <span>
                        Digital tickets will be sent immediately to your email after verification.
                      </span>
                    </li>
                  </ul>
                  <div className="border-t border-on-background/10 pt-3 flex flex-wrap gap-2 items-center">
                    <span className="font-label text-[9px] uppercase font-bold text-outline">
                      Scan QR using GCash, Maya, ShopeePay, BPI, UnionBank, or any QR Ph app
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={handlePayment}
        disabled={isSubmitting || !summary}
        className={`motion-button w-full border-4 border-on-background p-4 font-headline text-base font-extrabold uppercase tracking-wide text-white shadow-[4px_4px_0_0_#1c1b1b] transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed ${
          isSubmitting
            ? "bg-outline"
            : "bg-secondary hover:shadow-[6px_6px_0_0_#1c1b1b] active:shadow-none"
        }`}
      >
        {isSubmitting ? "Redirecting to QR Ph..." : "Proceed to QR Ph Payment"}
      </button>

      <button
        type="button"
        onClick={() => setCancelModalOpen(true)}
        disabled={isSubmitting}
        className="motion-button w-full border-4 border-on-background bg-background p-3 font-headline text-sm font-extrabold uppercase tracking-wide text-on-background shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:bg-surface-variant hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Cancel Checkout
      </button>



      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div
          className="motion-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="motion-modal w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6">
            <div className="border-b-4 border-on-background pb-3">
              <p className="font-label text-[10px] font-black uppercase text-outline">
                Cancel Checkout
              </p>
              <h3 className="mt-1 font-headline text-xl font-black uppercase text-secondary">
                Are you sure?
              </h3>
            </div>

            <p className="font-body-md text-sm leading-relaxed text-on-background">
              You are one step closer to having your ticket. If you cancel now, this checkout will be cleared and you will need to choose your seats again.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="motion-button border-4 border-on-background bg-tertiary-fixed p-3 font-headline text-xs font-extrabold uppercase text-on-background shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
              >
                Continue Checkout
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="motion-button border-4 border-on-background bg-secondary p-3 font-headline text-xs font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
