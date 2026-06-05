export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-primary px-4 py-4 text-white md:px-12">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold uppercase text-tertiary-fixed">DA REUNION</h1>
        <span className="rounded border-2 border-white bg-secondary px-3 py-1 font-label text-xs font-bold uppercase">
          Admin Panel
        </span>
      </div>
    </header>
  );
}
