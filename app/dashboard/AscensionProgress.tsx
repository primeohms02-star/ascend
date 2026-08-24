import type { AscensionState } from "@/lib/atlas/ascension";

type Props = {
  ascension: AscensionState;
};

function AscensionIcon() {
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
        d="M12 20V5m0 0L7 10m5-5 5 5M5 20h14"
      />
    </svg>
  );
}

export default function AscensionProgress({
  ascension,
}: Props) {
  const isMaximumLevel =
    ascension.xpRequiredForLevel === 0;

  const xpRemaining = Math.max(
    ascension.nextLevelTarget -
      ascension.score,
    0
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-400/[0.08] via-slate-900/80 to-slate-950 p-5 shadow-xl shadow-blue-950/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Ascension
            </p>

            <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl font-bold text-white">
                Level {ascension.level}
              </h2>

              <span className="text-sm font-semibold text-blue-300">
                {ascension.title} stage
              </span>
            </div>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <AscensionIcon />
          </div>
        </div>

        {/* XP progress */}

        <div className="mt-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">
                {ascension.score}
              </span>{" "}
              XP
            </p>

            <p className="text-sm font-semibold text-blue-300">
              {ascension.progressPercent}%
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-700"
              style={{
                width: `${ascension.progressPercent}%`,
              }}
            />
          </div>
        </div>

        {/* Next level */}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-slate-500">
            {isMaximumLevel
              ? "Highest defined Ascension level"
              : `${xpRemaining} XP to Level ${
                  ascension.level + 1
                }`}
          </p>

          {!isMaximumLevel && (
            <p className="text-xs text-slate-500">
              Next target:{" "}
              <span className="font-medium text-slate-300">
                {ascension.nextLevelTarget} XP
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
