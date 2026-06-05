import Image from "next/image";

const posterSrc = "/image/cinema_ticket.jpg";

const schedule = [
  { time: "1:00 PM", label: "Ingress" },
  { time: "2:20 PM", label: "Start Program" },
  { time: "2:35 PM", label: "Opening Remarks" },
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
  const repeatedSponsors = Array.from({ length: 4 }).flatMap(() => sponsors);

  return (
    <div className="flex animate-marquee items-center gap-12 font-headline text-3xl uppercase text-[#221b00]">
      {repeatedSponsors.map((sponsor, index) => (
        <span className="flex items-center gap-12" key={`${sponsor}-${index}`}>
          <span>{sponsor}</span>
          <span className="text-xl">{"\u2022"}</span>
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fcf9f8] text-[#1c1b1b]">
      <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-[#bb0014] bg-[#004e9f] shadow-[0_4px_0_#ffe16d]">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10 xl:px-16">
          <div className="flex min-w-0 items-center gap-7">
            <h1 className="shrink-0 font-headline text-2xl font-black uppercase tracking-normal text-[#ffe16d] md:text-3xl">
              DA REUNION
            </h1>
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
              <a className="font-label text-sm font-black uppercase text-[#ffe16d] underline decoration-2 underline-offset-8" href="#">
                Movies
              </a>
              <a className="font-label text-sm font-black uppercase text-white transition-colors hover:text-[#ffe16d]" href="#">
                Promos
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="railroad-border flex h-11 items-center gap-2 bg-[#1c1b1b] px-4 text-[#ffe16d] transition-transform active:scale-95">
              <Icon className="h-5 w-5" name="ticket" />
              <span className="font-label text-sm font-black uppercase">My Tickets</span>
            </button>
            <button
              aria-label="Account"
              className="hidden h-11 w-11 items-center justify-center text-[#ffe16d] transition-colors hover:bg-[#bb0014] md:flex"
            >
              <Icon className="h-7 w-7" name="account" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative border-b-4 border-[#1c1b1b] bg-[linear-gradient(120deg,#fff8eb_0%,#fcf9f8_52%,#ffe16d_52%,#ffe16d_54%,#fcf9f8_54%)]">
          <div className="mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-14 px-5 py-16 md:px-10 lg:grid-cols-[0.92fr_1.08fr] xl:px-16">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-2 top-5 z-20 bg-[#ffe16d] px-5 py-3 font-headline text-2xl uppercase text-[#221b00] shadow-[5px_5px_0_#bb0014] md:-left-5">
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

            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="mb-5 inline-flex border-2 border-[#1c1b1b] bg-white px-4 py-2 font-label text-xs font-black uppercase tracking-[0.22em] text-[#bb0014] shadow-[4px_4px_0_#ffe16d]">
                One-night-only reunion screening
              </p>
              <h2 className="font-headline text-[clamp(3.2rem,7vw,7rem)] font-black uppercase leading-[0.86] tracking-normal text-[#004e9f]">
                Home Along
                <br />
                <span className="text-[#bb0014] italic">Da Riles</span>
              </h2>
              <p className="mt-8 max-w-xl font-body-md text-lg leading-8 text-[#313030] md:text-xl">
                The ultimate nostalgic comeback! Join the Kosme family for a one-night-only reunion screening. Relive
                the laughter, the &quot;riles&quot; life, and the classic Pinoy humor that defined a generation.
              </p>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row lg:justify-start">
                <button className="border-4 border-[#1c1b1b] bg-[#bb0014] px-9 py-5 font-headline text-xl uppercase tracking-[0.14em] text-white shadow-[7px_7px_0_#1c1b1b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Buy Tickets Now
                </button>
                <button className="border-4 border-[#1c1b1b] bg-[#004e9f] px-9 py-5 font-headline text-xl uppercase tracking-[0.14em] text-white shadow-[7px_7px_0_#ffe16d] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  View Trailer
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-6 px-5 py-16 md:px-10 lg:grid-cols-[2fr_1fr] xl:px-16">
          <div className="border-4 border-[#1c1b1b] bg-[#1c1b1b] p-6 text-white shadow-[10px_10px_0_#bb0014] md:p-9">
            <div className="mb-8 flex items-center gap-4 text-[#ffe16d]">
              <Icon className="h-8 w-8" name="calendar" />
              <h3 className="font-headline text-4xl uppercase tracking-normal">Event Schedule</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {schedule.map((item) => (
                <div
                  className={
                    item.featured
                      ? "flex items-center justify-between gap-5 border-4 border-[#bb0014] bg-[#ffe16d] p-5 text-[#1c1b1b] shadow-[5px_5px_0_#bb0014] md:col-span-2"
                      : "flex items-center justify-between gap-5 border-b border-white/15 bg-white/5 p-5"
                  }
                  key={item.time}
                >
                  <span className={`font-headline text-3xl uppercase ${item.featured ? "text-[#1c1b1b]" : "text-[#ffe16d]"}`}>
                    {item.time}
                  </span>
                  <span className={`font-label text-lg font-black uppercase ${item.featured ? "text-[#1c1b1b]" : "text-white"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-[#1c1b1b] bg-[#004e9f] p-8 text-white shadow-[10px_10px_0_#ffe16d]">
            <Icon className="mb-7 h-12 w-12 text-[#ffe16d]" name="movie" />
            <h3 className="mb-5 font-headline text-3xl uppercase tracking-normal">Venue Info</h3>
            <div className="space-y-2 font-body-md text-lg">
              <p className="font-bold text-[#ffe16d]">Cinema 2, 3rd Floor</p>
              <p>Uptown Mall, BGC</p>
              <p>Taguig City</p>
            </div>
            <div className="mt-8 border-t-4 border-[#1c1b1b]/45 pt-7">
              <div className="flex items-center gap-3 text-[#ffe16d]">
                <Icon className="h-5 w-5" name="star" />
                <span className="font-label text-lg font-black uppercase">Limited Seats Available</span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y-4 border-[#1c1b1b] bg-[#ffe16d] py-5">
          <SponsorMarquee />
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 xl:px-16">
          <div className="grid items-center gap-10 border-4 border-[#1c1b1b] bg-[#bb0014] p-8 text-white shadow-[12px_12px_0_#1c1b1b] lg:grid-cols-[1.4fr_0.8fr] lg:p-14">
            <div>
              <span className="mb-5 inline-block -rotate-2 bg-[#ffe16d] px-5 py-2 font-headline text-2xl uppercase text-[#221b00]">
                Limited Engagement
              </span>
              <h2 className="font-headline text-5xl uppercase leading-none tracking-normal md:text-7xl">
                Don&apos;t Miss The <span className="text-[#ffe16d] italic">Biggest Reunion</span>
              </h2>
              <p className="mt-6 max-w-2xl font-body-md text-xl leading-8 text-white/90">
                Experience the Kosme family on the big screen once again with tickets, snacks, and full cinema energy.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <button className="border-4 border-[#1c1b1b] bg-[#ffe16d] px-8 py-5 font-headline text-2xl uppercase tracking-[0.12em] text-[#221b00] shadow-[7px_7px_0_#1c1b1b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                View Seat Map
              </button>
              <button className="border-4 border-white bg-[#1c1b1b] px-8 py-5 font-headline text-2xl uppercase tracking-[0.12em] text-[#ffe16d] transition-transform hover:scale-[1.02]">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-8 border-[#004e9f] bg-[#1c1b1b] px-5 py-12 text-white md:px-10 xl:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-headline text-3xl uppercase text-[#ffe16d]">DA REUNION</h2>
            <p className="mt-2 font-label text-sm uppercase tracking-[0.2em] text-white/55">
              Philippine cinema classics fan experience
            </p>
          </div>
          <div className="flex flex-wrap gap-5 font-label text-sm font-black uppercase">
            <a className="hover:text-[#ffe16d]" href="#">
              Home
            </a>
            <a className="hover:text-[#ffe16d]" href="#">
              Schedule
            </a>
            <a className="hover:text-[#ffe16d]" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>

      <button
        aria-label="Add tickets to cart"
        className="fixed bottom-8 right-8 z-40 hidden h-20 w-20 items-center justify-center rounded-full border-4 border-[#1c1b1b] bg-[#ffe16d] text-[#221b00] shadow-[8px_8px_0_#bb0014] transition-transform hover:scale-105 lg:flex"
      >
        <Icon className="h-9 w-9" name="cart" />
      </button>
    </div>
  );
}
