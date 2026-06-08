"use client";

import { useState, useEffect } from "react";
import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionTitle } from "@/components/ui/section-title";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

const CASH_RECEIPT_MARKER = "cash://counter-payment";

interface GroupedTicket {
  paymentReference: string | null;
  reservationStatus: string;
  paymentStatus: string;
  cinemaName: string;
  cinemaType: string;
  amount: number;
  seats: string[];
  ticketNumbers: string[];
  createdAt: string;
  ids: string[];
  ticketUrls: string[];
}

export function TicketConfirmationPage() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and render Google Login button on mount/state changes if not logged in
  useEffect(() => {
    if (user || authLoading) return;

    let attempts = 0;
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google) {
        clearInterval(interval);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
            callback: async (response: any) => {
              try {
                await loginWithGoogle(response.credential);
              } catch (err: any) {
                alert(`Authentication failed: ${err.message || err}`);
              }
            },
          });

          const buttonParent = document.getElementById("google-ticket-signin-btn");
          if (buttonParent) {
            (window as any).google.accounts.id.renderButton(buttonParent, {
              theme: "filled_blue",
              size: "large",
              width: 260,
            });
          }
        } catch (err) {
          console.error("Error initializing Google login on tickets page:", err);
        }
      } else {
        attempts++;
        if (attempts > 20) clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [user, authLoading, loginWithGoogle]);

  // Fetch reservations from API
  useEffect(() => {
    if (user) {
      fetchReservations();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/reservations/my-reservations");
      setReservations(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch tickets:", err);
      const errMsg = err.message || "";
      if (
        errMsg.toLowerCase().includes("unauthorized") ||
        errMsg.toLowerCase().includes("token") ||
        errMsg.toLowerCase().includes("jwt")
      ) {
        logout();
      } else {
        setError(errMsg || "Failed to load tickets. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (resStatus: string, payStatus: string, receiptUrl: string | null) => {
    if (resStatus === "CONFIRMED" && payStatus === "PAID") {
      return {
        label: "PAID & SECURED",
        classes: "bg-emerald-500 text-white border-black",
        shadow: "yellow" as const,
      };
    }
    if (resStatus === "PENDING" && receiptUrl === CASH_RECEIPT_MARKER) {
      return {
        label: "AWAITING CASH APPROVAL",
        classes: "bg-yellow-400 text-black border-black",
        shadow: "black" as const,
      };
    }
    if (resStatus === "PENDING" && receiptUrl) {
      return {
        label: "AWAITING GCASH REVIEW",
        classes: "bg-yellow-400 text-black border-black",
        shadow: "black" as const,
      };
    }
    if (resStatus === "PENDING" && !receiptUrl) {
      return {
        label: "PENDING PAYMENT",
        classes: "bg-amber-400 text-black border-black",
        shadow: "black" as const,
      };
    }
    if (resStatus === "CANCELLED") {
      return {
        label: "CANCELLED",
        classes: "bg-red-500 text-white border-black",
        shadow: "black" as const,
      };
    }
    return {
      label: `${resStatus} - ${payStatus}`,
      classes: "bg-gray-400 text-white border-gray-500",
      shadow: "black" as const,
    };
  };

  // Grouping reservations by payment reference or timestamp
  const groupReservations = (): GroupedTicket[] => {
    const grouped: Record<string, GroupedTicket> = {};

    reservations.forEach((r: any) => {
      const dateKey = new Date(r.createdAt).getTime();
      const roundedTime = Math.round(dateKey / 2000) * 2000;
      
      const refKey = r.paymentReference 
        ? `ref-${r.paymentReference}` 
        : `pending-${roundedTime}-${r.reservationStatus}`;

      if (!grouped[refKey]) {
        grouped[refKey] = {
          paymentReference: r.paymentReference,
          reservationStatus: r.reservationStatus,
          paymentStatus: r.paymentStatus,
          cinemaName: r.seat?.cinema?.name || "Cinema 2",
          cinemaType: r.cinemaType,
          amount: 0,
          seats: [],
          ticketNumbers: [],
          createdAt: r.createdAt,
          ids: [],
          ticketUrls: [],
        };
      }

      const group = grouped[refKey];
      group.amount += Number(r.amount);
      
      if (r.seat?.seatNumber && !group.seats.includes(r.seat.seatNumber)) {
        group.seats.push(r.seat.seatNumber);
      }
      if (r.ticketNumber && !group.ticketNumbers.includes(r.ticketNumber)) {
        group.ticketNumbers.push(r.ticketNumber);
      }
      if (!group.ids.includes(r.id)) {
        group.ids.push(r.id);
      }
      if (r.ticketUrl && !group.ticketUrls.includes(r.ticketUrl)) {
        group.ticketUrls.push(r.ticketUrl);
      }
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handlePrint = (ticket: GroupedTicket) => {
    if (ticket.ticketUrls && ticket.ticketUrls.length > 0) {
      ticket.ticketUrls.forEach((url) => {
        // FE-LOW-01 FIX: Validate ticket URL domain before opening
        try {
          const parsed = new URL(url);
          const isTrusted = parsed.protocol === 'https:' &&
            (parsed.hostname.endsWith('.supabase.co') || parsed.hostname.endsWith('.supabase.in'));
          if (isTrusted) {
            window.open(url, "_blank");
          } else {
            console.warn("Blocked untrusted ticket URL:", parsed.hostname);
          }
        } catch {
          console.warn("Invalid ticket URL format:", url);
        }
      });
    } else {
      window.print();
    }
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  // Not Authenticated State
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-20 lg:pt-12">
        <HardShadowCard shadow="black">
          <div className="p-4 text-center space-y-6 flex flex-col items-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-on-background bg-tertiary-fixed text-on-background shadow-[2px_2px_0_0_#1c1b1b]">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
              </svg>
            </div>
            <h2 className="font-headline text-2xl font-black uppercase text-secondary">
              Authentication Required
            </h2>
            <p className="font-body-md text-sm text-outline max-w-xs leading-relaxed">
              Sign in with your registered Google account to view your cinema tickets and order statuses.
            </p>
            <div className="border-t-2 border-on-background/10 pt-6 flex flex-col items-center gap-3 w-full">
              <div id="google-ticket-signin-btn" className="w-full flex justify-center"></div>
              
              {/* FE-HIGH-02 FIX: Dev login only in non-production */}
              {process.env.NODE_ENV !== "production" && (
              <button
                onClick={async () => {
                  try {
                    await loginWithGoogle("dev-token-customer");
                  } catch (err: any) {
                    alert(`Authentication failed: ${err.message || err}`);
                  }
                }}
                className="w-full max-w-[260px] border-4 border-on-background bg-tertiary-fixed py-2.5 font-headline text-xs font-bold uppercase shadow-[2px_2px_0_0_#1c1b1b] hover:bg-[#ffe88f] cursor-pointer"
              >
                Use Dev Login
              </button>
              )}
            </div>
          </div>
        </HardShadowCard>
      </div>
    );
  }

  const ticketGroups = groupReservations();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-12 pt-8 md:px-12 lg:pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionTitle 
          title="My Tickets" 
          subtitle="View and manage all your purchased cinema tickets and reservation history." 
        />
        {ticketGroups.length > 0 && (
          <button
            onClick={fetchReservations}
            className="self-start sm:self-center border-2 border-black bg-surface-variant px-4 py-2 font-headline text-xs font-black uppercase shadow-[2px_2px_0_0_#1c1b1b] hover:bg-secondary hover:text-white transition-colors active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            🔄 Refresh List
          </button>
        )}
      </div>

      {error && (
        <div className="border-4 border-secondary bg-secondary/10 p-4 font-body-md text-sm text-secondary font-bold shadow-[2px_2px_0_0_#1c1b1b]">
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {ticketGroups.length === 0 ? (
        <div className="max-w-2xl mx-auto py-12">
          <HardShadowCard shadow="black">
            <div className="text-center space-y-6 py-6 flex flex-col items-center">
              <div className="h-16 w-16 flex items-center justify-center rounded-full border-4 border-black bg-surface-variant text-outline shadow-[2px_2px_0_0_#1c1b1b]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-headline text-xl font-black uppercase text-secondary">
                  No Tickets Booked Yet
                </h3>
                <p className="font-body-md text-xs text-outline leading-relaxed">
                  You don't have any ticket transactions recorded under your account. Select your seats now to secure a movie ticket!
                </p>
              </div>
              <Link href="/seats">
                <PrimaryButton tone="primary">
                  Book Movie Tickets
                </PrimaryButton>
              </Link>
            </div>
          </HardShadowCard>
        </div>
      ) : (
        /* Ticket List */
        <div className="space-y-8">
          {ticketGroups.map((ticket, index) => {
            // Check status badge & shadow accent
            // In reservations array, check if any reservation has a receipt url
            const firstResItem = reservations.find(r => r.paymentReference === ticket.paymentReference || (r.createdAt === ticket.createdAt && r.reservationStatus === ticket.reservationStatus));
            const receiptUrl = firstResItem ? firstResItem.receiptUrl : null;
            const badge = getStatusBadge(ticket.reservationStatus, ticket.paymentStatus, receiptUrl);

            return (
              <div key={ticket.paymentReference || `${ticket.createdAt}-${index}`} className="animate-fade-in">
                <HardShadowCard shadow={badge.shadow}>
                  <div className="grid gap-6 lg:grid-cols-12 items-center">
                    
                    {/* Left details section */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-block border-2 px-2.5 py-0.5 text-[10px] font-headline font-black uppercase shadow-[1px_1px_0_0_#000] ${badge.classes}`}>
                          {badge.label}
                        </span>
                        <span className="font-label text-[10px] font-black uppercase bg-surface-variant border-2 border-black px-2 py-0.5 shadow-[1px_1px_0_0_#000]">
                          {ticket.cinemaType} Hall
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-headline text-lg font-black uppercase text-secondary leading-tight">
                          HOME ALONG DA RILES: DA REUNION
                        </h4>
                        
                        <div className="grid gap-2 sm:grid-cols-2 text-xs font-label uppercase text-outline">
                          <div>
                            <span className="opacity-75 block text-[9px]">Cinema & Seats</span>
                            <span className="font-black text-on-background text-sm">
                              {ticket.cinemaName} • {ticket.seats.join(", ")}
                            </span>
                          </div>
                          <div>
                            <span className="opacity-75 block text-[9px]">Transaction Ref #</span>
                            <span className="font-black text-on-background text-sm select-all">
                              {ticket.paymentReference || "N/A (Pending Approval)"}
                            </span>
                          </div>
                          <div>
                            <span className="opacity-75 block text-[9px]">Showing Schedule</span>
                            <span className="font-black text-on-background">
                              OCT 24, 2024 • 3:00 PM
                            </span>
                          </div>
                          <div>
                            <span className="opacity-75 block text-[9px]">Transaction Value</span>
                            <span className="font-black text-secondary text-sm">
                              ₱{ticket.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right stub section */}
                    <div className="lg:col-span-5 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-on-background/15 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <p className="font-label text-xs uppercase text-outline">Digital Ticket Stub</p>
                        
                        {ticket.ticketNumbers.length > 0 ? (
                          <div className="space-y-1">
                            <span className="font-label text-[9px] uppercase opacity-75">Digital Ticket ID(s):</span>
                            <div className="flex flex-wrap gap-1">
                              {ticket.ticketNumbers.map((tNum) => (
                                <span 
                                  key={tNum} 
                                  className="font-headline text-xs font-black uppercase border-2 border-black bg-tertiary-fixed text-on-background px-2.5 py-1 shadow-[2px_2px_0_0_#1c1b1b] select-all"
                                >
                                  🎫 {tNum}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="font-body-md text-xs text-outline italic">
                            Digital ticket codes and download pass will be available immediately upon transaction approval.
                          </p>
                        )}
                      </div>

                      {ticket.reservationStatus === "CONFIRMED" && (
                        <div className="mt-6">
                          <PrimaryButton onClick={() => handlePrint(ticket)} tone="primary" className="w-full">
                            Print Ticket
                          </PrimaryButton>
                        </div>
                      )}
                    </div>

                  </div>
                </HardShadowCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
