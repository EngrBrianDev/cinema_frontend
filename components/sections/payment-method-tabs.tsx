"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const methods = ["gcash", "card"] as const;
type Method = (typeof methods)[number];

export function PaymentMethodTabs() {
  const [method, setMethod] = useState<Method>("gcash");
  const [summary, setSummary] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();

  // GCash state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PayPal redirection is handled via hosted page

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("checkout_summary");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSummary(parsed);
          if (parsed.paymentMethod === "card" || parsed.paymentMethod === "paypal") {
            setMethod("card");
          }
        } catch (e) {
          console.error("Failed to parse checkout summary:", e);
        }
      }
    }
  }, []);

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

    try {
      // Step 1: Create a reservation for each seat sequentially or in parallel
      const reservationPromises = summary.seatIds.map((seatId: string, idx: number) => {
        const seatLabel = summary.selectedSeats[idx];
        return apiFetch("/reservations", {
          method: "POST",
          body: {
            cinemaId: summary.cinemaId,
            seatNumber: seatLabel,
          },
        });
      });

      const reservationResults = await Promise.all(reservationPromises);
      const resIds = reservationResults.map((r: any) => r.id);

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
        });

        if (result.approvalLink) {
          // Redirect the browser window directly to PayPal hosted payment page
          window.location.href = result.approvalLink;
        } else {
          throw new Error("Failed to retrieve PayPal approval link from the payment gateway.");
        }
      }
    } catch (err: any) {
      console.error("Payment submission failed:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    localStorage.removeItem("checkout_summary");
    router.push("/");
  };

  const totalAmount = summary ? summary.total : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {error}
        </div>
      )}

      {/* Payment tabs */}
      <div className="grid gap-3 grid-cols-2">
        {methods.map((item) => (
          <button
            key={item}
            onClick={() => {
              setMethod(item);
              setError(null);
            }}
            disabled={isSubmitting}
            className={`border-4 p-3 font-headline text-sm font-extrabold uppercase tracking-wider transition-all shadow-[3px_3px_0_0_#1c1b1b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              method === item
                ? "bg-secondary text-white border-on-background"
                : "bg-surface-variant border-outline hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#1c1b1b] hover:border-on-background"
            }`}
          >
            {item === "gcash" ? "GCash QR" : "PayPal / Card"}
          </button>
        ))}
      </div>

      {/* Payment details content */}
      <div className="border-4 border-on-background bg-background p-6 shadow-[4px_4px_0_0_#1c1b1b]">
        {method === "card" ? (
          <div className="space-y-5 text-center py-6 px-4 flex flex-col items-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-on-background bg-[#0070ba] text-white shadow-[2px_2px_0_0_#1c1b1b]">
              <span className="font-headline text-2xl font-black italic tracking-tighter">P</span>
            </div>
            
            <div className="space-y-2 max-w-sm">
              <h3 className="font-headline text-lg font-black uppercase text-secondary">
                Pay with PayPal / Card
              </h3>
              <p className="font-body-md text-xs text-outline leading-relaxed">
                You will be redirected to PayPal's secure page to complete your payment. 
                You can pay using your <strong>PayPal account</strong> or a <strong>Debit / Credit Card</strong> directly without registering.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-on-background/10 pt-4 w-full">
              <img
                src="/image/paypal-logo.png"
                alt="PayPal Logo"
                className="h-6 object-contain opacity-75"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-label text-[10px] uppercase font-bold text-outline">
                Supports Visa, Mastercard, AMEX, Discover
              </span>
            </div>
          </div>
        ) : (
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
                className={`border-4 border-dashed border-outline hover:border-secondary bg-surface-variant flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[180px] transition-colors relative ${
                  receiptPreview ? "p-2" : ""
                }`}
              >
                {receiptPreview ? (
                  <div className="relative w-full h-full min-h-[160px] flex flex-col items-center justify-center">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="max-h-[130px] object-contain border-2 border-on-background mb-2"
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
        )}
      </div>

      {/* Action CTA */}
      <button
        onClick={handlePayment}
        disabled={isSubmitting || !summary}
        className={`w-full border-4 border-on-background p-4 font-headline text-base font-extrabold uppercase tracking-wide text-white shadow-[4px_4px_0_0_#1c1b1b] transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed ${
          isSubmitting
            ? "bg-outline"
            : "bg-secondary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
        }`}
      >
        {isSubmitting
          ? (method === "card" ? "Redirecting to PayPal..." : "Processing Payment...")
          : (method === "card" ? "Proceed to PayPal" : "Complete Payment")}
      </button>

      {/* Success Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border-4 border-on-background bg-background p-6 shadow-[8px_8px_0_0_#1c1b1b] space-y-6 animate-scale-up">
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
              className="w-full border-4 border-on-background bg-secondary p-3 font-headline text-sm font-extrabold uppercase text-white shadow-[3px_3px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Back to Movies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
