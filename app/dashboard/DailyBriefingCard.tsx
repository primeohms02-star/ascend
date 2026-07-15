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
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-8 text-white shadow-2xl">

      {/* Background Glow */}

      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">

        {/* Header */}

        <div className="mb-8 flex items-start justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
              Today's Briefing
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {greeting}
            </h1>

            <p className="mt-2 text-slate-400">
              Everything you need to focus on today.
            </p>

          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
            Today
          </div>

        </div>

        {/* Situation */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">

          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-blue-400">
            Situation
          </p>

          <p className="leading-8 text-slate-300">
            {summary}
          </p>

        </div>

        {/* Primary Focus */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">

          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-blue-400">
            Primary Focus
          </p>

          <p className="text-lg font-medium text-white">
            {focus}
          </p>

        </div>

        {/* Cortex Insight */}

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-blue-400">
            Cortex Insight
          </p>

          <p className="text-lg italic leading-8 text-slate-200">
            "{oracle}"
          </p>

        </div>

      </div>

    </section>
  );
}