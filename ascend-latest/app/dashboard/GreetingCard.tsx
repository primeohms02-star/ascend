type GreetingCardProps = {
  greeting: string;
  identity: string;
  score: number;
};

export default function GreetingCard({
  greeting,
  identity,
  score,
}: GreetingCardProps) {
  const nextIdentity =
    score < 100
      ? "Builder"
      : score < 250
      ? "Creator"
      : score < 500
      ? "Leader"
      : "Ascendant";

  const progress =
    score < 100
      ? score
      : score < 250
      ? score - 100
      : score < 500
      ? score - 250
      : score - 500;

  const max =
    score < 100
      ? 100
      : score < 250
      ? 150
      : score < 500
      ? 250
      : 500;

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">

      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
        ASCEND
      </p>

      <h1 className="mt-4 text-5xl font-extrabold">
        {greeting} 👋
      </h1>

      <p className="mt-3 max-w-2xl text-lg text-slate-300">
        Every decision you make today shapes the person you become tomorrow.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

          <p className="text-xs uppercase tracking-widest text-orange-300">
            Identity
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {identity}
          </h2>

        </div>

        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

          <p className="text-xs uppercase tracking-widest text-orange-300">
            Ascension Score
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            ⭐ {score}
          </h2>

        </div>

        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

          <p className="text-xs uppercase tracking-widest text-orange-300">
            Next Identity
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {nextIdentity}
          </h2>

        </div>

      </div>

      <div className="mt-8">

        <div className="flex justify-between text-sm text-slate-300">

          <span>
            Progress to {nextIdentity}
          </span>

          <span>
            {progress}/{max} XP
          </span>

        </div>

        <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/20">

          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-700"
            style={{
              width: `${(progress / max) * 100}%`,
            }}
          />

        </div>

      </div>

    </section>
  );
}