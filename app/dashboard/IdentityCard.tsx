type IdentityCardProps = {
  title: string;
  level: number;
};

export default function IdentityCard({
  title,
  level,
}: IdentityCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Identity
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-slate-600">
            Level {level}
          </p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
          🧭
        </div>

      </div>

      <div className="mt-6 rounded-2xl bg-slate-100 p-4">
        <p className="text-sm text-slate-600">
          Your identity evolves as you consistently complete missions and move closer to your North Star.
        </p>
      </div>
    </section>
  );
}