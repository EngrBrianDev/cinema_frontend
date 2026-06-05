import Image from "next/image";

const posterSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuArCul4T9mRGOX3aFI68PjVceBk1gTuCwVzyZMBtP-3goBFYSieX8YzDUbOoD5cSUIEtH_YCJCOn8M72y_9fEG5gY7-9LT2FNQyBs4Gf3nCCJuR9Aa4pbfQxW-C1F0qzDCuYzPOTM9dP18xyv4DUh7uxWFEc1mLlKBcsLsdUwp5Mcsxd8xqE21Yj2rF13mESRFUhGJbYNVPAaua7dTjV0LdhNdqvmYXe3oXB40jiHC3HgXEtXlMoLqelITRqudlaKbtd14YoXQFwe89";

const schedule = [
  { time: "1:00 PM", label: "Ingress", className: "border-b border-surface-variant/20 hover:bg-secondary/20 group" },
  { time: "2:20 PM", label: "Start Program", className: "border-l-4 border-secondary" },
  { time: "2:35 PM", label: "Opening Remarks", className: "border-b border-surface-variant/20" },
];

const sponsorItems = ["INSPIRE GROUP", "MEGAWORLD", "UPTOWN MALL", "DESKHRX"];

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
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: '"FILL" 1' } : undefined}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function SponsorMarquee() {
  const repeatedSponsors = Array.from({ length: 3 }).flatMap(() => sponsorItems);

  return (
    <div className="flex animate-marquee gap-16 font-pixel-display text-4xl">
      {repeatedSponsors.map((item, index) => (
        <span className="flex items-center gap-16" key={`${item}-${index}`}>
          <span>{item}</span>
          <span>{"\u2022"}</span>
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b-4 border-on-primary-fixed bg-primary px-margin-mobile shadow-[0_4px_0_0_#ba1a1a] md:px-margin-desktop">
        <div className="flex items-center gap-8">
          <h1 className="font-pixel-display text-headline-md uppercase tracking-tighter text-tertiary-fixed lg:text-4xl">
            DA REUNION
          </h1>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            <a className="font-label-bold text-label-bold uppercase text-tertiary-fixed underline-offset-8 border-b-2 border-tertiary-fixed" href="#">
              Movies
            </a>
            <a className="font-label-bold text-label-bold uppercase transition-colors hover:text-tertiary-fixed" href="#">
              Promos
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button className="railroad-border hidden items-center gap-2 bg-on-background px-4 py-2 active:scale-95 sm:flex">
            <MaterialIcon className="text-tertiary-fixed">confirmation_number</MaterialIcon>
            <span className="font-label-bold text-label-bold uppercase">My Tickets</span>
          </button>
          <button className="p-2 transition-transform hover:bg-secondary-container active:scale-95" aria-label="Account">
            <MaterialIcon className="text-3xl text-tertiary-fixed">account_circle</MaterialIcon>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-container-max px-margin-mobile pb-24 pt-32 md:px-margin-desktop">
        <section className="relative mb-24 flex min-h-[600px] items-center">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="relative z-10 flex justify-center lg:col-span-5 lg:justify-start">
              <div className="relative w-full max-w-md">
                <div className="-rotate-2 bg-on-background p-3 hard-shadow-red">
                  <Image
                    alt="Main event poster"
                    className="h-auto w-full border-4 border-white grayscale-0 transition-all duration-300 hover:grayscale"
                    src={posterSrc}
                    width={850}
                    height={1200}
                    priority
                  />
                </div>
                <div className="starburst animate-float absolute -left-8 -top-10 z-20 flex h-28 w-28 items-center justify-center bg-tertiary-fixed sm:-left-12 sm:-top-12 sm:h-32 sm:w-32">
                  <span className="font-pixel-display text-xl text-on-tertiary-fixed">HOT!</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 text-center lg:col-span-7 lg:text-left">
              <h2 className="font-headline-lg text-headline-lg-mobile uppercase leading-[0.9] text-primary md:text-7xl lg:text-8xl">
                HOME ALONG <br />
                <span className="text-secondary italic">DA RILES</span>
              </h2>
              <p className="mx-auto max-w-2xl font-body-lg text-xl leading-relaxed text-on-surface-variant lg:mx-0">
                The ultimate nostalgic comeback! Join the Kosme family for a one-night-only reunion screening. Relive
                the laughter, the &quot;riles&quot; life, and the classic Pinoy humor that defined a generation.
              </p>
              <div className="mt-4 flex flex-col justify-center gap-6 sm:flex-row lg:justify-start">
                <button className="bg-secondary px-12 py-6 font-headline-md text-2xl uppercase tracking-widest text-on-secondary transition-all hard-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Buy Tickets Now
                </button>
                <button className="bg-primary px-12 py-6 font-headline-md text-2xl uppercase tracking-widest text-on-primary transition-all hard-shadow-yellow hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  View Trailer
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24 grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <div className="rounded-xl border-4 border-tertiary bg-on-background p-10 shadow-[12px_12px_0_0_#ba1a1a] lg:col-span-2">
            <div className="mb-8 flex items-center gap-4">
              <MaterialIcon className="text-5xl text-tertiary-fixed">event_available</MaterialIcon>
              <h3 className="font-pixel-display text-headline-lg-mobile uppercase text-tertiary-fixed md:text-4xl">
                Event Schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 font-label-bold md:grid-cols-2">
              {schedule.map((item) => (
                <div
                  className={`flex items-center justify-between bg-surface-container-highest/10 p-4 transition-colors ${item.className}`}
                  key={item.time}
                >
                  <span className="text-2xl text-tertiary-fixed">{item.time}</span>
                  <span className="text-xl uppercase text-on-primary-container group-hover:text-tertiary-fixed">
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="-rotate-1 flex items-center justify-between bg-tertiary-fixed p-6 text-on-tertiary-fixed hard-shadow-red">
                <span className="text-3xl font-black">3:00 PM</span>
                <span className="text-3xl font-black uppercase tracking-tighter">Film Showing</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border-4 border-on-background bg-primary p-10 shadow-[12px_12px_0_0_#ffe16d]">
            <div>
              <MaterialIcon className="mb-6 text-7xl text-tertiary-fixed" fill>
                movie
              </MaterialIcon>
              <h3 className="mb-4 font-headline-md text-3xl uppercase text-on-primary">Venue Info</h3>
              <div className="space-y-2 font-body-lg text-xl text-on-primary-container">
                <p className="font-bold">Cinema 2, 3rd Floor</p>
                <p>Uptown Mall, BGC</p>
                <p>Taguig City</p>
              </div>
            </div>

            <div className="mt-8 border-t-4 border-on-primary-fixed-variant pt-8">
              <div className="flex items-center gap-3 text-tertiary-fixed">
                <MaterialIcon className="text-3xl">star</MaterialIcon>
                <span className="font-label-bold text-xl uppercase">Limited Seats Available</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="rotate-1 overflow-hidden whitespace-nowrap border-y-4 border-on-background bg-tertiary-fixed py-6 text-on-tertiary-fixed shadow-lg">
            <SponsorMarquee />
          </div>
        </section>

        <section className="relative overflow-hidden border-4 border-on-background bg-surface p-16 hard-shadow-black md:p-24">
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <MaterialIcon className="mb-8 text-7xl text-secondary">local_activity</MaterialIcon>
            <h3 className="mb-6 font-headline-lg text-headline-lg-mobile uppercase text-primary md:text-6xl">
              Ready to Board?
            </h3>
            <p className="mb-12 font-body-lg text-2xl leading-relaxed text-on-surface-variant">
              Don&apos;t miss out on the biggest family reunion of the year. Relive the Kosme family magic on the big
              screen! Tickets are selling fast.
            </p>
            <div className="flex w-full max-w-2xl flex-wrap justify-center gap-8">
              <button className="min-w-64 flex-1 rounded-lg bg-primary px-12 py-6 font-headline-md text-2xl uppercase text-on-primary transition-all hard-shadow-red hover:translate-y-1 hover:shadow-none">
                View Seat Map
              </button>
              <button className="min-w-64 flex-1 rounded-lg border-4 border-on-background bg-white px-12 py-6 font-headline-md text-2xl uppercase text-on-background transition-all hard-shadow-yellow hover:translate-y-1 hover:shadow-none">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      <section className="mx-auto mb-24 max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden border-l-4 border-t-8 border-on-background bg-secondary p-12 hard-shadow-yellow md:p-20">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-10">
            <div className="grid scale-150 grid-cols-6 gap-4 rotate-12">
              {Array.from({ length: 6 }).map((_, index) => (
                <MaterialIcon className="text-9xl" key={index}>
                  {index % 2 === 0 ? "confirmation_number" : "movie"}
                </MaterialIcon>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="text-center lg:text-left">
              <span className="-rotate-2 mb-6 inline-block bg-tertiary-fixed px-6 py-2 font-pixel-display text-2xl uppercase text-on-tertiary-fixed">
                Limited Engagement
              </span>
              <h2 className="mb-4 font-headline-lg text-5xl uppercase leading-none tracking-tighter text-white md:text-7xl">
                DON&apos;T MISS THE <br />
                <span className="text-tertiary-fixed italic">BIGGEST REUNION</span>
              </h2>
              <p className="max-w-xl font-body-lg text-xl text-white opacity-90">
                Experience the magic of the Kosme family on the big screen once again. A tribute to the golden era of
                Pinoy sitcoms.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="rotate-2 bg-white p-4 hard-shadow-black">
                <p className="text-center font-pixel-display text-4xl uppercase text-secondary">COMING SOON</p>
                <p className="text-center font-label-bold text-on-background">DECEMBER 2024</p>
              </div>
              <button className="border-4 border-tertiary-fixed bg-on-background px-16 py-8 font-headline-md text-3xl uppercase tracking-widest text-tertiary-fixed transition-transform hover:scale-105">
                BUY TICKETS NOW
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-8 border-secondary bg-on-background px-margin-mobile py-16 text-on-primary md:px-margin-desktop">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <h1 className="mb-4 font-pixel-display text-2xl uppercase text-tertiary-fixed">DA REUNION</h1>
            <p className="font-label-bold text-sm uppercase leading-relaxed opacity-60">
              The ultimate fan experience for Philippine cinema classics.
            </p>
          </div>

          {[
            { title: "Quick Links", links: ["Home", "Schedule", "About Us"] },
            { title: "Support", links: ["FAQs", "Privacy Policy", "Contact"] },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="mb-6 font-label-bold uppercase text-white">{column.title}</h4>
              <ul className="space-y-4 font-label-bold text-sm uppercase">
                {column.links.map((link) => (
                  <li key={link}>
                    <a className="hover:text-tertiary-fixed" href="#">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-6 font-label-bold uppercase text-white">Follow Us</h4>
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="h-10 w-10 cursor-pointer rounded-sm bg-outline-variant transition-colors hover:bg-tertiary-fixed"
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1440px] border-t border-outline-variant/10 pt-8">
          <div className="flex flex-col items-center gap-4">
            <p className="font-label-bold text-xs uppercase tracking-widest opacity-60">Secure Payment Methods</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              {[
                ["account_balance_wallet", "GCash"],
                ["payments", "Maya"],
                ["credit_card", "Credit Card"],
              ].map(([icon, label]) => (
                <div className="flex items-center gap-2" key={label}>
                  <MaterialIcon className="text-3xl text-tertiary-fixed">{icon}</MaterialIcon>
                  <span className="font-label-bold text-sm uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1440px] border-t border-outline-variant/10 pt-8 text-center">
          <p className="font-label-bold text-xs uppercase opacity-40">
            {"\u00a9"} 2024 DA REUNION EVENTS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      <div className="fixed bottom-12 right-12 z-40 hidden lg:block">
        <button
          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-on-background bg-tertiary-fixed text-on-tertiary-fixed shadow-[8px_8px_0_0_#bb0014] transition-transform hover:scale-110 active:scale-95"
          aria-label="Add tickets to cart"
        >
          <MaterialIcon className="text-4xl">add_shopping_cart</MaterialIcon>
        </button>
      </div>
    </>
  );
}
