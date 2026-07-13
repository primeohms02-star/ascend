type Props = {
  greeting: string;
  summary: string;
  focus: string;
  oracle: string;
};

export default function DailyBriefingCard({
  greeting,
  summary,
  focus,
  oracle,
}: Props) {
  return (
    <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-orange-400">
            Atlas Daily Briefing
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {greeting}
          </h1>
        </div>

        <div className="rounded-2xl bg-orange-500/20 px-4 py-2 text-orange-300">
          Today
        </div>

      </div>

      <div className="space-y-5">

        <div>
          <h2 className="font-semibold text-orange-300">
            Situation
          </h2>

          <p className="mt-1 text-slate-300">
            {summary}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-orange-300">
            Primary Focus
          </h2>

          <p className="mt-1 text-slate-300">
            {focus}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">

          <p className="text-sm uppercase tracking-widest text-orange-300">
            Oracle
          </p>

          <p className="mt-2 text-lg italic">
            "{oracle}"
          </p>

        </div>

      </div>

    </section>
  );
}