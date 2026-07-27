import type { Opportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: Opportunity;
};

export default function OpportunityHero({
  opportunity,
}: Props) {
  const tags = opportunity.tags ?? [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Opportunity
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {opportunity.title}
        </h1>

        <p className="mt-3 text-lg text-slate-400">
          {opportunity.company}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {opportunity.remote && (
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm font-medium text-cyan-300">
              🌍 Remote
            </span>
          )}

          {!opportunity.remote && opportunity.location && (
            <span className="rounded-full border border-slate-600/70 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
              📍 {opportunity.location}
            </span>
          )}

          {opportunity.category && (
            <span className="rounded-full border border-slate-600/70 bg-slate-800 px-3 py-1.5 text-sm capitalize text-slate-300">
              {opportunity.category}
            </span>
          )}

          {opportunity.salary && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
              {opportunity.salary}
            </span>
          )}

          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-600/70 bg-slate-800 px-3 py-1.5 text-sm text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}