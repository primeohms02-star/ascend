type Props = {
  score: number;
  level: number;
};

export default function AscensionProgress({
  score,
  level,
}: Props) {
  const currentLevelStart =
    level === 1
      ? 0
      : level === 2
      ? 100
      : level === 3
      ? 250
      : level === 4
      ? 500
      : 1000;

  const nextLevelTarget =
    level === 1
      ? 100
      : level === 2
      ? 250
      : level === 3
      ? 500
      : level === 4
      ? 1000
      : 2000;

  const progress =
    ((score - currentLevelStart) /
      (nextLevelTarget - currentLevelStart)) *
    100;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 shadow-2xl">

      {/* Ambient Glow */}

      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Ascension
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              Level {level}
            </h2>

            <p className="mt-2 text-slate-400">
              Keep climbing toward your highest potential.
            </p>

          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
            ⭐
          </div>

        </div>

        {/* XP */}

        <div className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <span className="text-sm uppercase tracking-[0.15em] text-slate-400">
              Experience
            </span>

            <span className="text-sm font-bold text-blue-400">
              {score} XP
            </span>

          </div>

          <div className="relative h-4 overflow-hidden rounded-full bg-slate-800">

            <div className="absolute inset-0 rounded-full bg-blue-500/5" />

            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.55)]"
              style={{
                width: `${Math.min(progress, 100)}%`,
              }}
            />

          </div>

        </div>

        {/* Level Progress */}

        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

          <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
            Next Milestone
          </p>

          <p className="mt-3 text-lg text-slate-300">
            <span className="font-bold text-white">{score}</span>
            {" / "}
            <span className="font-bold text-blue-300">
              {nextLevelTarget}
            </span>
            {" XP required for the next Ascension Level."}
          </p>

        </div>

      </div>

    </section>
  );
}