import { HardShadowCard } from "@/components/ui/hard-shadow-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionTitle } from "@/components/ui/section-title";
import { confirmedTicket } from "@/lib/mock-data/cinema-data";

export function TicketConfirmationPage() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Ticket Secured" subtitle="A copy of this ticket has been sent to your email." />
      <div className="grid gap-6 lg:grid-cols-2">
        <HardShadowCard shadow="black">
          <p className="font-label text-xs uppercase text-outline">Order Summary</p>
          <p className="mt-4">Movie: {confirmedTicket.movieTitle}</p>
          <p>Date: {confirmedTicket.date}</p>
          <p>Time: {confirmedTicket.time}</p>
          <p>Seats: {confirmedTicket.seats.join(", ")}</p>
        </HardShadowCard>
        <HardShadowCard shadow="yellow">
          <p className="font-label text-xs uppercase text-outline">Digital Ticket</p>
          <h3 className="mt-2 font-headline text-2xl font-extrabold text-primary">{confirmedTicket.cinema}</h3>
          <p className="mt-1">{confirmedTicket.movieTitle}</p>
          <p className="mt-6 font-label text-xs uppercase">Ticket ID: {confirmedTicket.ticketId}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <PrimaryButton>Save to Phone</PrimaryButton>
            <PrimaryButton tone="primary">Print Ticket</PrimaryButton>
          </div>
        </HardShadowCard>
      </div>
    </div>
  );
}
