type AlignmentBarProps = {
  alignment: number;
};

export default function AlignmentBar({ alignment }: AlignmentBarProps) {
  const safeAlignment = Math.max(
    0,
    Math.min(100, Number.isFinite(alignment) ? alignment : 0)
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Current level progress
        </span>
        <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm font-bold text-cyan-300 shadow-[0_0_18px_rgba(59,130,246,0.12)]">
          {Math.round(safeAlignment)}% level progress
        </span>
      </div>

      <div
        className="relative h-4 w-full overflow-hidden rounded-full border border-white/[0.07] bg-[#03060C] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.025)]"
        role="progressbar"
        aria-label="Current Ascension level progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safeAlignment)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 via-slate-950 to-black" />
        <div className="absolute inset-0 flex justify-between px-[20%]">
          <span className="h-full w-px bg-white/[0.055]" />
          <span className="h-full w-px bg-white/[0.055]" />
          <span className="h-full w-px bg-white/[0.055]" />
          <span className="h-full w-px bg-white/[0.055]" />
        </div>

        <div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 shadow-[0_0_18px_rgba(59,130,246,0.55)]"
          style={{ width: `${safeAlignment}%` }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/55" />
        </div>

        {safeAlignment > 0 && (
          <div
            className="absolute top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_8px_rgba(165,243,252,0.85)]"
            style={{ left: `${safeAlignment}%` }}
          />
        )}
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>Beginning</span>
        <span>Building</span>
        <span>Advancing</span>
      </div>
    </div>
  );
}
