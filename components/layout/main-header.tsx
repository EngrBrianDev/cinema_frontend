import Link from "next/link";

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-primary text-white">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-12">
        <div className="flex items-center gap-6">
          <h1 className="font-headline text-2xl font-extrabold uppercase text-tertiary-fixed">DA REUNION</h1>
          <nav className="hidden gap-4 md:flex">
            <Link href="/" className="font-label text-sm font-bold uppercase">
              Movies
            </Link>
            <Link href="/seats" className="font-label text-sm font-bold uppercase">
              Seats
            </Link>
            <Link href="/checkout" className="font-label text-sm font-bold uppercase">
              Checkout
            </Link>
          </nav>
        </div>
        <Link href="/ticket" className="rounded border-2 border-white px-3 py-2 font-label text-xs font-bold uppercase">
          My Tickets
        </Link>
      </div>
    </header>
  );
}
