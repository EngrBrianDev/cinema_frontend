export function SeatLegend({ showPwd }: { showPwd?: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-8 border-t border-outline/20 pt-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-sm border-2 border-outline bg-surface-variant shadow-[1px_1px_0_0_#1c1b1b]" />
        <span className="font-label text-xs uppercase text-outline">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-sm border-2 border-on-background bg-secondary shadow-[2px_2px_0_0_#1c1b1b]" />
        <span className="font-label text-xs uppercase text-secondary">Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-outline-variant bg-on-background/10 opacity-35">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: 10 }}>
            close
          </span>
        </div>
        <span className="font-label text-xs uppercase text-outline-variant">Reserved</span>
      </div>
      {showPwd && (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-primary bg-primary/20 text-primary font-extrabold text-[8px] shadow-[1px_1px_0_0_#004e9f]">
            <span>PWD</span>
          </div>
          <span className="font-label text-xs uppercase text-primary">PWD / Wheelchair</span>
        </div>
      )}
    </div>
  );
}
