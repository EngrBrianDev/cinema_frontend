import { SeatTypeTabs } from "@/components/sections/seats/seat-type-tabs";

export function SeatSelectionPage() {
  return (
    <div className="space-y-12 w-full flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-12 relative">
        <div className="star-decoration absolute -left-4 -top-4 h-12 w-12 rotate-12 bg-tertiary-fixed opacity-80" />
        <div className="star-decoration absolute -top-8 right-16 hidden h-16 w-16 -rotate-12 bg-white opacity-25 md:block" />

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-4 inline-block border-2 border-on-background bg-tertiary px-4 py-1.5 font-label text-xs font-bold uppercase tracking-widest text-white">
              Uptown Mall BGC
            </span>
            <h2 className="font-headline text-6xl font-extrabold uppercase leading-none text-primary lg:text-8xl">
              SELECT SEATS
            </h2>
            <p className="mt-3 font-body-md text-sm text-outline">
              Choose between C2 standard cinema or Ultra premium recliner seating.
            </p>
          </div>

          <div className="hard-shadow-red w-full max-w-md border-4 border-on-background bg-on-background p-6">
            <p className="mb-1 font-label text-xs font-bold uppercase text-tertiary-fixed">Now Showing:</p>
            <p className="font-headline text-2xl font-bold leading-tight text-white">
              HOME ALONG DA RILES: THE REUNION
            </p>
            <div className="mt-4 flex gap-4 font-label text-xs uppercase text-outline-variant">
              <span>Dec 24, 2024</span>
              <span>•</span>
              <span>7:30 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[95vw] sm:max-w-[90vw] px-4 md:px-12">
        <SeatTypeTabs />
      </div>
    </div>
  );
}
