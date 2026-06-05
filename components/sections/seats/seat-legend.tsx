export function SeatLegend() {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-8 border-t border-outline/20 pt-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-sm border-2 border-outline bg-surface-variant shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]" />
        <span className="font-label text-xs uppercase text-outline">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-sm border-2 border-white bg-secondary shadow-[2px_2px_0_0_#ffffff]" />
        <span className="font-label text-xs uppercase text-secondary">Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-outline-variant bg-on-background opacity-40">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>
            close
          </span>
        </div>
        <span className="font-label text-xs uppercase text-outline-variant">Reserved</span>
      </div>
    </div>
  );
}
