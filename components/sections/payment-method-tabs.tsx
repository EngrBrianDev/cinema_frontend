"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  releasePendingPaypalReservations,
  savePendingPaypalReservationIds,
} from "@/lib/checkout-reservations";
import { useAuth } from "@/context/auth-context";

const visibleMethods = ["gcash"] as const;
type Method = "gcash" | "card";

type CheckoutSummary = {
  paymentMethod?: string;
  seatIds: string[];
  selectedSeats: string[];
  cinemaId: string;
  total: number;
};

type ReservationResult = {
  id: string;
};

type PaypalOrderResult = {
  approvalLink?: string;
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

function getInitialMethod(summary: CheckoutSummary | null): Method {
  void summary;
  return "gcash";
}

export function PaymentMethodTabs() {
  const [summary] = useState<CheckoutSummary | null>(() => readCheckoutSummary());
  const [method, setMethod] = useState<Method>(() => getInitialMethod(summary));
  const router = useRouter();
  const { user } = useAuth();

  const [redirectPath, setRedirectPath] = useState("/");

  // GCash state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = async () => {
    if (!summary) {
      setError("No booking summary found. Please select seats first.");
      return;
    }
    if (!user) {
      setError("Please sign in to proceed with your booking.");
      return;
    }

    // Validation
    if (method === "gcash" && !receiptFile) {
      setError("Please upload your GCash payment receipt first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const createdReservationIds: string[] = [];

    try {
      // Step 1: Create reservations sequentially so partial holds can be released on failure.
      const reservationResults: ReservationResult[] = [];
      for (let idx = 0; idx < summary.seatIds.length; idx++) {
        const seatLabel = summary.selectedSeats[idx];
        const reservation = await apiFetch("/reservations", {
          method: "POST",
          body: {
            cinemaId: summary.cinemaId,
            seatNumber: seatLabel,
          },
        }) as ReservationResult;
        reservationResults.push(reservation);
        createdReservationIds.push(reservation.id);
      }

      const resIds = reservationResults.map((r) => r.id);

      // Step 2: Charge / Submit receipt
      if (method === "gcash") {
        const formData = new FormData();
        formData.append("receipt", receiptFile!);
        formData.append("reservationIds", JSON.stringify(resIds));

        await apiFetch("/payments/gcash/submit", {
          method: "POST",
          body: formData,
        });

        // GCash Success Modal Setup
        setRedirectPath("/");
        setModalTitle("Thank you for your payment");
        setModalBody(
          "You will receive ticket via your registered email on or before 24 hours.\n\nIf you still haven't receive your ticket on or before 24 hours. Please reach out us at info@inspire-alliance.com"
        );
        setModalOpen(true);
      } else {
        // PayPal redirection checkout order flow
        const result = await apiFetch("/payments/paypal/create-order", {
          method: "POST",
          body: {
            reservationIds: resIds,
          },
        }) as PaypalOrderResult;

        if (result.approvalLink) {
          // FE-MED-01 FIX: Validate PayPal redirect URL domain
          try {
            const approvalUrl = new URL(result.approvalLink);
            const isValidPayPal = approvalUrl.protocol === 'https:' &&
              (approvalUrl.hostname.endsWith('.paypal.com') || approvalUrl.hostname === 'paypal.com');
            if (!isValidPayPal) {
              throw new Error("Invalid payment gateway URL detected. Aborting for your safety.");
            }
          } catch (urlErr: unknown) {
            if (urlErr instanceof Error && urlErr.message.includes("Invalid payment")) throw urlErr;
            throw new Error("Invalid approval link received from payment gateway.");
          }
          savePendingPaypalReservationIds(resIds);
          window.location.href = result.approvalLink;
        } else {
          throw new Error("Failed to retrieve PayPal approval link from the payment gateway.");
        }
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

  const handleModalClose = () => {
    setModalOpen(false);
    localStorage.removeItem("checkout_summary");
    sessionStorage.removeItem("checkout_entry_allowed");
    router.push(redirectPath);
  };

  const handleConfirmCancel = async () => {
    setCancelModalOpen(false);
    try {
      await releasePendingPaypalReservations();
    } catch (err) {
      console.error("Failed to release pending PayPal reservations:", err);
    }
    localStorage.removeItem("checkout_summary");
    sessionStorage.removeItem("checkout_entry_allowed");
    router.push("/seats");
  };

  const totalAmount = summary ? summary.total : 0;
  const paymentTabsLocked = isSubmitting;

  return (
    <div className="motion-panel space-y-6">
      {error && (
        <div className="motion-error border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {error}
        </div>
      )}

      {/* Payment tabs */}
      <div className="grid gap-3">
        {visibleMethods.map((item) => (
          <button
            key={item}
            onClick={() => {
              setMethod(item);
              setError(null);
            }}
            disabled={paymentTabsLocked}
            aria-disabled={paymentTabsLocked}
            className={[
              "motion-button border-4 p-3 font-headline text-sm font-extrabold uppercase tracking-wider transition-all shadow-[3px_3px_0_0_#1c1b1b] active:shadow-none",
              paymentTabsLocked
                ? "cursor-not-allowed border-outline-variant bg-on-background/10 text-outline opacity-50 shadow-none"
                : method === item
                  ? "bg-secondary text-white border-on-background"
                  : "bg-surface-variant border-outline hover:shadow-[4px_4px_0_0_#1c1b1b] hover:border-on-background",
            ].join(" ")}
          >
            GCash QR
          </button>
        ))}
      </div>

      {/* Payment details content */}
      <div key={method} className="motion-tab-content border-4 border-on-background bg-background p-6 shadow-[4px_4px_0_0_#1c1b1b]">
        <div className="space-y-6 flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* GCash QR */}
            <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-3">
              <span className="font-label text-xs uppercase font-extrabold text-secondary">
                Scan to Pay: ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <div className="border-4 border-on-background p-2 bg-white shadow-[3px_3px_0_0_#1c1b1b]">
                <img
                  src="/image/gcash-qr.png"
                  alt="GCash QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="font-body-sm text-[11px] text-outline leading-tight max-w-[200px]">
                Scan the QR code above in your GCash app and send the exact amount.
              </p>
            </div>

            {/* Receipt Upload */}
            <div className="w-full md:w-1/2 flex flex-col space-y-3 self-stretch justify-center">
              <span className="font-label text-xs uppercase font-extrabold">
                Upload Payment Receipt
              </span>
              
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`motion-input border-4 border-dashed border-outline hover:border-secondary bg-surface-variant flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[180px] transition-colors relative ${
                  receiptPreview ? "p-2" : ""
                }`}
              >
                {receiptPreview ? (
                  <div className="relative w-full h-full min-h-[160px] flex flex-col items-center justify-center">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="motion-panel max-h-[130px] object-contain border-2 border-on-background mb-2"
                    />
                    <span className="font-label text-[9px] uppercase font-bold bg-secondary text-white px-2 py-0.5 rounded shadow-[1px_1px_0_0_#1c1b1b]">
                      Selected: {receiptFile?.name}
                    </span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-outline mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="font-label text-xs font-bold uppercase text-secondary">
                      Choose Screenshot
                    </p>
                    <p className="font-body-sm text-[10px] text-outline mt-1 leading-none">
                      PNG, JPG, JPEG files only
                    </p>
                  </>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>
            </div>
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
        <span className="inline-flex items-center justify-center gap-2">
          {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {isSubmitting ? "Processing Payment..." : "Complete Payment"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setCancelModalOpen(true)}
        disabled={isSubmitting}
        className="motion-button w-full border-4 border-on-background bg-background p-3 font-headline text-sm font-extrabold uppercase tracking-wide text-on-background shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:bg-surface-variant hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Cancel Checkout
      </button>

      {/* Success Modal */}
      {modalOpen && (
        <div className="motion-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="motion-modal w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6">
            <div className="flex items-center justify-between border-b-4 border-on-background pb-3">
              <h3 className="font-headline text-xl font-black uppercase text-secondary">
                {modalTitle}
              </h3>
            </div>
            
            <p className="font-body-md text-sm text-on-background leading-relaxed whitespace-pre-line">
              {modalBody}
            </p>

            <button
              onClick={handleModalClose}
              className="motion-button w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:shadow-[5px_5px_0_0_#1c1b1b] active:shadow-none"
            >
              Back to Movies
            </button>
          </div>
        </div>
      )}

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
