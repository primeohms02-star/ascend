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
    <section className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Ascension Progress
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Level {level}
          </h2>
        </div>

        <div className="text-4xl">
          ⭐
        </div>

      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-700"
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        />

      </div>

      <p className="mt-4 text-slate-600">
        {score} / {nextLevelTarget} XP
      </p>

    </section>
  );
}