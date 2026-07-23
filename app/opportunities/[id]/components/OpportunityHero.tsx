"use client";

import SaveOpportunityButton from "@/app/components/SaveOpportunityButton";
import ApplyOpportunityButton from "@/app/components/ApplyOpportunityButton";
import { RankedOpportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: RankedOpportunity;
};

export default function OpportunityHero({
  opportunity,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <h1 className="text-4xl font-bold text-white">
            {opportunity.title}
          </h1>

          <p className="mt-3 text-lg text-slate-400">
            {opportunity.company}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            {opportunity.remote && (
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                🌍 Remote
              </span>
            )}

            {(opportunity.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
              >
                {tag}
              </span>
            ))}

          </div>

        </div>

        <div className="flex gap-3">

          <SaveOpportunityButton
            opportunity={opportunity}
          />

          <ApplyOpportunityButton
            opportunity={opportunity}
          />

        </div>

      </div>

    </section>
  );
}