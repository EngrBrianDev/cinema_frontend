import type { Buyer, PaymentSummary, TicketInfo } from "@/types/cinema";

export const eventSchedule = [
  { time: "1:30 PM", label: "Ingress" },
  { time: "2:00 PM", label: "Start of Program" },
  { time: "3:00 PM", label: "Film Showing" },
];

export const buyers: Buyer[] = [
  { name: "Ricardo Marasigan", email: "richie.m@dapamilya.com", seatLabel: "V.I.P - A12", status: "Paid" },
  { name: "Kevin Santos", email: "kev_santos90@gmail.com", seatLabel: "Standard - D04", status: "Pending" },
  { name: "Liza Aragon", email: "liza_the_star@yahoo.com", seatLabel: "V.I.P - A13", status: "Paid" },
  { name: "Boy Tapang", email: "tapang_na_boy@gmail.com", seatLabel: "Standard - F11", status: "Failed" },
];

export const checkoutSummary: PaymentSummary = {
  subtotal: 1050,
  serviceFee: 0,
  total: 1050,
};

export const confirmedTicket: TicketInfo = {
  movieTitle: "HOME ALONG DA RILES: DA REUNION",
  date: "OCT 24, 2024",
  time: "3:00 PM",
  cinema: "CINEMA 2",
  seats: ["H-12", "H-13"],
  ticketId: "HAR-8829-9120",
};
