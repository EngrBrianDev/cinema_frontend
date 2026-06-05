import Image from "next/image";

const schedule = [
  { time: "1:00 PM", label: "Ingress" },
  { time: "2:20 PM", label: "Start Program" },
  { time: "2:35 PM", label: "Opening Remarks" },
  { time: "3:00 PM", label: "Film Showing", featured: true },
];

const sponsors = ["INSPIRE GROUP", "MEGAWORLD", "UPTOWN MALL", "DESKHRX"];

function MaterialIcon({
  children,
  className = "",
  fill = false,
}: {
  children: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: '"FILL" 1' } : undefined}
    >
      {children}
    </span>
  );
}

function PricingPoster() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border-4 border-[#1c1b1b] bg-[#8f000f] shadow-[12px_12px_0_#1c1b1b]">
      <Image
        alt="Cinema pricing ticket poster"
        className="h-full w-full object-cover"
        src="/Image/cinema_pricing.jpg"
        width={1024}
        height={1280}
        priority
      />
    </div>
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
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b]">
      <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-[#bb0014] bg-[#004e9f] shadow-[0_4px_0_#ffe16d]">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 xl:px-16">
          <div className="flex min-w-0 items-center gap-8">
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
            <button className="railroad-border flex h-11 min-w-11 items-center justify-center gap-2 bg-[#1c1b1b] px-4 text-[#ffe16d] transition-transform active:scale-95 sm:min-w-40">
              <MaterialIcon>confirmation_number</MaterialIcon>
              <span className="hidden font-label text-sm font-black uppercase sm:inline">My Tickets</span>
            </button>
            <button className="hidden h-11 w-11 items-center justify-center text-[#ffe16d] transition-colors hover:bg-[#bb0014] md:flex" aria-label="Account">
              <MaterialIcon className="text-3xl">account_circle</MaterialIcon>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative overflow-hidden border-b-4 border-[#1c1b1b] bg-[linear-gradient(120deg,#fff8eb_0%,#fcf9f8_48%,#ffe16d_48%,#ffe16d_50%,#fcf9f8_50%)]">
          <div className="mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-12 px-5 py-16 md:px-10 lg:grid-cols-[0.95fr_1.05fr] xl:px-16">
            <div className="relative mx-auto w-full max-w-[540px]">
              <div className="absolute -left-3 top-5 z-20 bg-[#ffe16d] px-5 py-3 font-headline text-2xl uppercase text-[#221b00] shadow-[5px_5px_0_#bb0014] md:-left-7">
                HOT!
              </div>
              <PricingPoster />
            </div>

            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="mb-4 inline-flex border-2 border-[#1c1b1b] bg-white px-4 py-2 font-label text-xs font-black uppercase tracking-[0.24em] text-[#bb0014] shadow-[4px_4px_0_#ffe16d]">
                One-night-only reunion screening
              </p>
              <h2 className="font-headline text-[clamp(3.3rem,8vw,7.75rem)] font-black uppercase leading-[0.82] tracking-normal text-[#004e9f]">
                Home Along
                <br />
                <span className="text-[#bb0014] italic">Da Riles</span>
              </h2>
              <p className="mt-8 max-w-xl font-body-md text-lg leading-8 text-[#313030] md:text-xl">
                The ultimate nostalgic comeback! Join the Kosme family for a one-night-only reunion screening. Relive
                the laughter, the &quot;riles&quot; life, and the classic Pinoy humor that defined a generation.
              </p>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row lg:justify-start">
                <button className="border-4 border-[#1c1b1b] bg-[#bb0014] px-9 py-5 font-headline text-xl uppercase tracking-[0.16em] text-white shadow-[7px_7px_0_#1c1b1b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Buy Tickets Now
                </button>
                <button className="border-4 border-[#1c1b1b] bg-[#004e9f] px-9 py-5 font-headline text-xl uppercase tracking-[0.16em] text-white shadow-[7px_7px_0_#ffe16d] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  View Trailer
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-6 px-5 py-16 md:px-10 lg:grid-cols-[2fr_1fr] xl:px-16">
          <div className="border-4 border-[#1c1b1b] bg-[#1c1b1b] p-6 text-white shadow-[10px_10px_0_#bb0014] md:p-9">
            <div className="mb-8 flex items-center gap-4 text-[#ffe16d]">
              <MaterialIcon className="text-4xl">event_available</MaterialIcon>
              <h3 className="font-headline text-4xl uppercase tracking-normal">Event Schedule</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {schedule.map((item) => (
                <div
                  className={
                    item.featured
                      ? "md:col-span-2 flex items-center justify-between gap-5 border-4 border-[#bb0014] bg-[#ffe16d] p-5 text-[#1c1b1b] shadow-[5px_5px_0_#bb0014]"
                      : "flex items-center justify-between gap-5 border-b border-white/15 bg-white/5 p-5"
                  }
                  key={item.time}
                >
                  <span className="font-headline text-3xl uppercase text-[#ffe16d] [--featured-color:#1c1b1b]">
                    <span className={item.featured ? "text-[#1c1b1b]" : ""}>{item.time}</span>
                  </span>
                  <span className={`font-label text-lg font-black uppercase ${item.featured ? "text-[#1c1b1b]" : "text-white"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-[#1c1b1b] bg-[#004e9f] p-8 text-white shadow-[10px_10px_0_#ffe16d]">
            <MaterialIcon className="mb-7 text-6xl text-[#ffe16d]" fill>
              movie
            </MaterialIcon>
            <h3 className="mb-5 font-headline text-3xl uppercase tracking-normal">Venue Info</h3>
            <div className="space-y-2 font-body-md text-lg">
              <p className="font-bold text-[#ffe16d]">Cinema 2, 3rd Floor</p>
              <p>Uptown Mall, BGC</p>
              <p>Taguig City</p>
            </div>
            <div className="mt-8 border-t-4 border-[#1c1b1b]/45 pt-7">
              <div className="flex items-center gap-3 text-[#ffe16d]">
                <MaterialIcon>star</MaterialIcon>
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
            <a className="hover:text-[#ffe16d]" href="#">Home</a>
            <a className="hover:text-[#ffe16d]" href="#">Schedule</a>
            <a className="hover:text-[#ffe16d]" href="#">Contact</a>
          </div>
        </div>
      </footer>

      <button
        aria-label="Add tickets to cart"
        className="fixed bottom-8 right-8 z-40 hidden h-20 w-20 items-center justify-center rounded-full border-4 border-[#1c1b1b] bg-[#ffe16d] text-[#221b00] shadow-[8px_8px_0_#bb0014] transition-transform hover:scale-105 lg:flex"
      >
        <MaterialIcon className="text-4xl">add_shopping_cart</MaterialIcon>
      </button>
    </div>
  );
}
