"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { apiFetch } from "@/lib/api";

const posterSrc = "/image/cinema_ticket.jpg";
const trailerEmbedSrc = "https://www.youtube.com/embed/mwEGtZ17aao";

const schedule = [
  { time: "1:30 PM", label: "Ingress" },
  { time: "2:00 PM", label: "Start of Program" },
  { time: "3:00 PM", label: "Film Showing", featured: true },
];

const sponsors = ["INSPIRE GROUP", "MEGAWORLD", "UPTOWN MALL", "DESKHRX"];

function Icon({
  name,
  className = "",
}: {
  name: "account" | "cart" | "calendar" | "movie" | "star" | "ticket";
  className?: string;
}) {
  const base = `shrink-0 ${className}`;

  if (name === "ticket") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5v-2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M9 8.5v7M15 8.5v7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "account") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (name === "movie") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M5 5h14v14H5V5ZM8 5v14M16 5v14M5 9h3M5 15h3M16 9h3M16 15h3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M4 5h2l2.1 9.4A2 2 0 0 0 10 16h6.7a2 2 0 0 0 1.9-1.4L20 9H8M10 20h.01M17 20h.01"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={base} fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9L12 2.8Z" />
    </svg>
  );
}

function SponsorMarquee() {
  const repeatedSponsors = Array.from({ length: 12 }).flatMap(() => sponsors);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#ffe16d] via-[#ffe16d]/80 to-transparent opacity-90 blur-sm z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#ffe16d] via-[#ffe16d]/80 to-transparent opacity-90 blur-sm z-10" />
      <div className="relative z-0 flex animate-marquee min-w-[200%] items-center gap-8 font-headline text-xl uppercase text-[#221b00] sm:gap-10 sm:text-2xl md:gap-12 md:text-3xl">
        {repeatedSponsors.map((sponsor, index) => (
          <span className="flex items-center gap-8 sm:gap-10 md:gap-12 whitespace-nowrap" key={`${sponsor}-${index}`}>
            <span>{sponsor}</span>
            <span className="text-xl">{"\u2022"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [cinemas, setCinemas] = useState<any[]>([]);

  useEffect(() => {
    async function loadCinemas() {
      try {
        const data = await apiFetch("/cinemas");
        setCinemas(data || []);
      } catch (err) {
        console.error("Failed to load cinemas on home page:", err);
      }
    }
    loadCinemas();
  }, []);

  const activePromoCinema = cinemas.find(c => c.activePromotion);
  const activePromo = activePromoCinema?.activePromotion;

  return (
    <div className="min-h-screen overflow-hidden bg-[#fcf9f8] text-[#1c1b1b]">
      <MainHeader />

      <main className="pt-[7.75rem] lg:pt-20">
        {activePromo && (
          <div className="bg-[#ffe16d] border-b-4 border-[#1c1b1b] py-3 px-4 shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)] animate-fade-in">
            <div className="cinema-wide-container flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-pulse">🔥</span>
                <div className="text-left">
                  <p className="font-headline text-sm font-black uppercase text-[#bb0014]">
                    SPECIAL PROMOTION ACTIVE: {activePromo.name}!
                  </p>
                  <p className="font-body-md text-xs text-black mt-0.5 font-bold">
                    {activePromoCinema.name} tickets are discounted to just <span className="text-[#004e9f] font-black">₱{activePromo.promoPrice.toFixed(2)}</span>!
                  </p>
                </div>
              </div>
              <Link
                href="/seats"
                className="shrink-0 border-2 border-on-background bg-[#bb0014] text-white px-4 py-1.5 font-headline text-xs font-black uppercase shadow-[2px_2px_0_0_#1c1b1b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                Grab Tickets Now 🎟️
              </Link>
            </div>
          </div>
        )}
        <section className="relative border-b-4 border-[#1c1b1b] bg-[linear-gradient(120deg,#fff8eb_0%,#fcf9f8_52%,#ffe16d_52%,#ffe16d_54%,#fcf9f8_54%)]">
          <div className="cinema-wide-container grid items-center gap-8 px-4 py-8 sm:px-5 md:gap-12 md:px-10 md:py-12 lg:min-h-[720px] lg:grid-cols-[0.92fr_1.08fr] lg:py-14 xl:px-16 [min-width:1800px]:min-h-[820px] [min-width:2400px]:min-h-[940px]">
            <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[520px] [min-width:1800px]:max-w-[620px] [min-width:2400px]:max-w-[760px]">
              <div className="absolute -left-1 top-4 z-20 bg-[#ffe16d] px-3 py-2 font-headline text-lg uppercase text-[#221b00] shadow-[5px_5px_0_#bb0014] sm:px-5 sm:py-3 sm:text-2xl md:-left-5">
                HOT!
              </div>
              <div className="-rotate-2 border-4 border-[#1c1b1b] bg-[#1c1b1b] p-3 shadow-[12px_12px_0_#bb0014]">
                <Image
                  alt="Home Along Da Riles reunion poster"
                  className="aspect-[1023/1280] h-auto w-full border-4 border-white object-cover"
                  height={1280}
                  priority
                  src={posterSrc}
                  width={1023}
                />
              </div>
            </div>

            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left [min-width:1800px]:max-w-3xl [min-width:2400px]:max-w-4xl">
              <p className="mb-4 inline-flex max-w-full border-2 border-[#1c1b1b] bg-white px-3 py-2 font-label text-[10px] font-black uppercase leading-snug tracking-[0.12em] text-[#bb0014] shadow-[4px_4px_0_#ffe16d] sm:text-xs sm:tracking-[0.18em] md:mb-5 md:tracking-[0.22em]">
                One-night-only reunion screening
              </p>
              <h2 className="font-headline text-[clamp(2.25rem,13vw,7rem)] font-black uppercase leading-[0.9] tracking-normal text-[#004e9f] [min-width:1800px]:text-[8rem] [min-width:2400px]:text-[9.5rem]">
                Home Along
                <br />
                <span className="text-[#bb0014] italic">Da Riles</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl font-body-md text-[clamp(0.95rem,3.7vw,1.25rem)] leading-7 text-[#313030] md:mt-8 md:leading-8 lg:mx-0 [min-width:1800px]:max-w-2xl [min-width:1800px]:text-2xl [min-width:1800px]:leading-9">
                The ultimate nostalgic comeback! Join the Kosme family for a one-night-only reunion screening. Relive
                the laughter, the &quot;riles&quot; life, and the classic Pinoy humor that defined a generation.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row md:mt-10 lg:justify-start">
                <Link
                  href="/seats"
                  className="inline-flex min-h-14 w-full items-center justify-center border-4 border-[#1c1b1b] bg-[#bb0014] px-5 py-4 text-center font-headline text-base uppercase tracking-[0.1em] text-white shadow-[7px_7px_0_#1c1b1b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:w-auto sm:px-7 md:px-9 md:py-5 md:text-xl md:tracking-[0.14em]"
                >
                  Buy Tickets Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-4 border-[#1c1b1b] bg-[#004e9f] px-4 py-10 text-white sm:px-5 md:px-10 md:py-16 xl:px-16">
          <div className="cinema-wide-container grid items-center gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <span className="inline-block bg-[#ffe16d] px-4 py-2 font-label text-xs font-black uppercase text-[#221b00] shadow-[4px_4px_0_#bb0014]">
                Official Trailer
              </span>
              <h2 className="mt-5 font-headline text-[clamp(2rem,9vw,4rem)] font-black uppercase leading-none tracking-normal text-white">
                Watch The Trailer
              </h2>
              <p className="mt-5 max-w-xl font-body-md text-base leading-7 text-white/85 sm:text-lg md:text-xl md:leading-8">
                Get a quick taste of the reunion screening and the classic Pinoy comedy energy coming back to the big screen.
              </p>
            </div>

            <div className="border-4 border-[#1c1b1b] bg-[#1c1b1b] p-2 shadow-[10px_10px_0_#ffe16d] sm:p-3">
              <div className="aspect-video w-full overflow-hidden bg-[#1c1b1b]">
                <iframe
                  className="h-full w-full"
                  src={trailerEmbedSrc}
                  title="Home Along Da Riles official trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="cinema-wide-container grid gap-6 px-4 py-10 sm:px-5 md:px-10 md:py-16 lg:grid-cols-[2fr_1fr] xl:px-16">
          <div className="border-4 border-[#1c1b1b] bg-[#1c1b1b] p-4 text-white shadow-[10px_10px_0_#bb0014] sm:p-6 md:p-9">
            <div className="mb-6 flex items-center gap-3 text-[#ffe16d] md:mb-8 md:gap-4">
              <Icon className="h-7 w-7 sm:h-8 sm:w-8" name="calendar" />
              <h3 className="font-headline text-[clamp(1.75rem,8vw,2.25rem)] uppercase leading-tight tracking-normal">Event Schedule</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {schedule.map((item) => (
                <div
                  className={
                    item.featured
                      ? "flex flex-col gap-2 border-4 border-[#bb0014] bg-[#ffe16d] p-4 text-[#1c1b1b] shadow-[5px_5px_0_#bb0014] min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between sm:p-5 md:col-span-2"
                      : "flex flex-col gap-2 border-b border-white/15 bg-white/5 p-4 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between sm:p-5"
                  }
                  key={item.time}
                >
                  <span className={`font-headline text-[clamp(1.5rem,7vw,1.875rem)] uppercase leading-tight ${item.featured ? "text-[#1c1b1b]" : "text-[#ffe16d]"}`}>
                    {item.time}
                  </span>
                  <span className={`font-label text-sm font-black uppercase leading-snug sm:text-base lg:text-lg ${item.featured ? "text-[#1c1b1b]" : "text-white"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-[#1c1b1b] bg-[#004e9f] p-5 text-white shadow-[10px_10px_0_#ffe16d] sm:p-8">
            <Icon className="mb-7 h-12 w-12 text-[#ffe16d]" name="movie" />
            <h3 className="mb-5 font-headline text-[clamp(1.6rem,7vw,1.875rem)] uppercase leading-tight tracking-normal">Venue Info</h3>
            <div className="space-y-2 font-body-md text-base sm:text-lg">
              <p className="font-bold text-[#ffe16d]">Cinema 2, 3rd Floor</p>
              <p>Uptown Mall, BGC</p>
              <p>Taguig City</p>
            </div>
            <div className="mt-8 border-t-4 border-[#1c1b1b]/45 pt-7">
              <div className="flex items-center gap-3 text-[#ffe16d]">
                <Icon className="h-5 w-5" name="star" />
                <span className="font-label text-sm font-black uppercase leading-snug sm:text-lg">Limited Seats Available</span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y-4 border-[#1c1b1b] bg-[#ffe16d] py-4 md:py-5">
          <div className="w-full max-w-none flex flex-col items-center gap-3 px-0">
            <p className="font-label text-center text-sm font-black uppercase tracking-[0.35em] text-[#221b00] sm:text-base md:text-lg">
              Sponsored by:
            </p>
            <SponsorMarquee />
          </div>
        </section>

        <section className="cinema-wide-container px-4 py-10 sm:px-5 md:px-10 md:py-16 xl:px-16">
          <div className="grid items-center gap-8 border-4 border-[#1c1b1b] bg-[#bb0014] p-5 text-white shadow-[8px_8px_0_#1c1b1b] sm:p-7 md:shadow-[12px_12px_0_#1c1b1b] lg:grid-cols-[1.4fr_0.8fr] lg:p-14">
            <div>
              <span className="mb-4 inline-block -rotate-2 bg-[#ffe16d] px-4 py-2 font-headline text-base uppercase text-[#221b00] sm:text-xl md:mb-5 md:px-5 md:text-2xl">
                Limited Engagement
              </span>
              <h2 className="font-headline text-[clamp(2rem,10vw,4.5rem)] uppercase leading-[0.95] tracking-normal">
                Don&apos;t Miss The <span className="text-[#ffe16d] italic">Biggest Reunion</span>
              </h2>
              <p className="mt-5 max-w-2xl font-body-md text-base leading-7 text-white/90 sm:text-lg md:mt-6 md:text-xl md:leading-8">
                Experience the Kosme family on the big screen once again with tickets, snacks, and full cinema energy.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:gap-5">
              <Link
                href="/seats"
                className="inline-flex min-h-14 flex-1 items-center justify-center border-4 border-[#1c1b1b] bg-[#ffe16d] px-5 py-4 text-center font-headline text-base uppercase tracking-[0.08em] text-[#221b00] shadow-[7px_7px_0_#1c1b1b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:px-8 md:py-5 md:text-2xl md:tracking-[0.12em]"
              >
                View Seat Map
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MainFooter />

    </div>
  );
}
