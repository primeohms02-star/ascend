type ProgressCardProps = {
  progress: number;
  momentum: string;
  message: string;
};

function ProgressIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V9m6 10V5m6 14v-7m4 7H2"
      />
    </svg>
  );
}

export default function ProgressCard({
  progress,
  momentum,
  message,
}: ProgressCardProps) {
  const safeProgress = Math.max(
    0,
    Math.min(100, progress)
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.07] via-slate-900/80 to-slate-950 p-6 shadow-xl shadow-cyan-950/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Journey Progress
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {safeProgress}%
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <ProgressIcon />
          </div>
        </div>

        {/* Progress bar */}

        <div className="mt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-400">
              Current level progress
            </span>

            <span className="text-sm font-semibold text-cyan-300">
              {safeProgress}%
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-700"
              style={{
                width: `${safeProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Momentum */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Momentum
            </p>

            <p className="mt-1 font-semibold text-cyan-300">
              {momentum}
            </p>
          </div>

          <p className="max-w-xs text-right text-xs leading-5 text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}