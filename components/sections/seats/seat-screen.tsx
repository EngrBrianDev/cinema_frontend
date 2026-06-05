export function SeatScreen() {
  return (
    <div className="mb-14 flex w-full max-w-3xl flex-col items-center">
      <div className="mb-2 h-3 w-full rounded-full bg-surface-variant opacity-20 blur-md" />
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-on-background/50 shadow-[0_0_16px_rgba(255,255,255,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
      <p className="mt-3 font-label text-xs uppercase tracking-[0.8em] text-outline">SCREEN</p>
    </div>
  );
}
