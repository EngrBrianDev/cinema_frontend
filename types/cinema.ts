export type BuyerStatus = "Paid" | "Pending" | "Failed";

export interface Buyer {
  name: string;
  email: string;
  seatLabel: string;
  status: BuyerStatus;
}

export interface PaymentSummary {
  subtotal: number;
  serviceFee: number;
  total: number;
}

export interface TicketInfo {
  movieTitle: string;
  date: string;
  time: string;
  cinema: string;
  seats: string[];
  ticketId: string;
}
