import Link from "next/link";
import SaveOpportunityButton from "@/app/components/SaveOpportunityButton";
import ApplyOpportunityButton from "@/app/components/ApplyOpportunityButton";

import { RankedOpportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: RankedOpportunity;
  insight: any;
};

export default function OpportunityCard({
  opportunity,
  insight,
}: Props) {
  return (
   <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <h2 className="text-xl font-semibold text-white">
            {opportunity.title}
          </h2>

          <p className="mt-1 text-slate-400">
            {opportunity.company}
          </p>

        </div>

       <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-500/30 bg-cyan-500/10">

  <div className="text-center">

    <div className="text-lg font-bold text-cyan-300">
      {insight.matchScore}
    </div>

    <div className="text-[10px] text-slate-400">
      MATCH
    </div>

  </div>

</div>

      </div>

      {/* Tags */}

      <div className="mt-5 flex flex-wrap gap-2">

        {opportunity.remote && (
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
            Remote
          </span>
        )}

        {(opportunity.tags ?? []).slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}

      </div>

      {/* Atlas Summary */}

      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">

        <p className="text-xs uppercase tracking-wide text-slate-400">
          Atlas Recommendation
        </p>

<div className="mt-5">

  <p className="mb-2 text-sm font-semibold text-white">
    Why Atlas picked this
  </p>

  <ul className="space-y-2">

    {insight.reasons.slice(0,3).map((reason:string)=>(
      <li
        key={reason}
        className="text-sm text-slate-300"
      >
        ✓ {reason}
      </li>
    ))}

  </ul>

</div>

        <p className="mt-2 font-medium text-cyan-300">
          {insight.level}
        </p>

        <p className="mt-2 text-sm text-slate-300">
          Career Readiness +{insight.readinessGain}%
        </p>

      </div>

      {/* Missing Skills */}

      {insight.missingSkills.length > 0 && (

        <div className="mt-5">

          <p className="mb-2 text-sm font-medium text-white">
            Missing Skills
          </p>

          <div className="flex flex-wrap gap-2">

            {insight.missingSkills.slice(0, 3).map((skill: string) => (

              <span
                key={skill}
                className="rounded-full bg-orange-500/10 px-2 py-1 text-[11px] text-xs text-orange-300"
              >
                {skill}
              </span>

            ))}

          </div>

        </div>

      )}

      {/* Actions */}

      <div className="mt-6 flex items-center gap-3">

        <Link
          href={`/opportunities/${opportunity.id}`}
          className="flex-1 rounded-xl border border-slate-700 py-2 text-center text-sm font-medium text-white transition hover:border-cyan-400"
        >
          View opportunity
        </Link>

        <SaveOpportunityButton
          opportunity={opportunity}
        />

        <ApplyOpportunityButton
          opportunity={opportunity}
        />

      </div>

    </div>
  );
}