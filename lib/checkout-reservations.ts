import { apiFetch } from "@/lib/api";

const PAYPAL_PENDING_RESERVATION_IDS_KEY = "paypal_pending_reservation_ids";

export function savePendingPaypalReservationIds(reservationIds: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYPAL_PENDING_RESERVATION_IDS_KEY, JSON.stringify(reservationIds));
}

export function clearPendingPaypalReservationIds() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PAYPAL_PENDING_RESERVATION_IDS_KEY);
}

export function getPendingPaypalReservationIds() {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(PAYPAL_PENDING_RESERVATION_IDS_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function releasePendingPaypalReservations() {
  const reservationIds = getPendingPaypalReservationIds();
  if (!reservationIds.length) return false;

  try {
    await apiFetch("/reservations/cancel", {
      method: "POST",
      body: { reservationIds },
    });
    return true;
  } finally {
    clearPendingPaypalReservationIds();
  }
}

export async function getUnavailableSelectedSeats(cinemaId: string, selectedSeats: string[]) {
  const selectedSet = new Set(selectedSeats.map((seat) => seat.trim().toUpperCase()));
  if (!cinemaId || selectedSet.size === 0) return [];

  const seats = await apiFetch(`/cinemas/${cinemaId}/seats`);
  if (!Array.isArray(seats)) return [];

  return seats
    .filter((seat: any) => {
      const seatNumber = typeof seat.seatNumber === "string" ? seat.seatNumber.trim().toUpperCase() : "";
      return selectedSet.has(seatNumber) && seat.occupied;
    })
    .map((seat: any) => seat.seatNumber)
    .filter((seatNumber: unknown): seatNumber is string => typeof seatNumber === "string");
}
