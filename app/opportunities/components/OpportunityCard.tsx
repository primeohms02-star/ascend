import Link from "next/link";

import SaveOpportunityButton from "@/app/components/SaveOpportunityButton";
import ApplyOpportunityButton from "@/app/components/ApplyOpportunityButton";

import type { RankedOpportunity } from "@/lib/atlas/opportunities/types";

type OpportunityExplanation = {
  matchScore: number;
  reasons: string[];
  level: string;
  readinessGain: number;
  missingSkills: string[];
};

type Props = {
  opportunity: RankedOpportunity;
  insight: OpportunityExplanation;
};

function clampScore(score: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5h5v5m0-5-9 9M19 14v5H5V5h5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
}

export default function OpportunityCard({
  opportunity,
  insight,
}: Props) {
  const matchScore = clampScore(
    insight.matchScore
  );

  const scoreDegrees = matchScore * 3.6;

  const encodedOpportunityId =
    encodeURIComponent(opportunity.id);

  const decisionHref =
    `/opportunities/${encodedOpportunityId}` +
    `?source=${encodeURIComponent(
      opportunity.source
    )}`;

  const reasons = insight.reasons ?? [];

  const missingSkills =
    insight.missingSkills ?? [];

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-950/20 sm:p-7">
      {/* Hover decoration */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-cyan-500/0 blur-3xl transition duration-500 group-hover:bg-cyan-500/[0.07]"
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {opportunity.category && (
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold capitalize tracking-wide text-cyan-300">
                  {opportunity.category}
                </span>
              )}

              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                {opportunity.source}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-semibold leading-snug text-white transition group-hover:text-cyan-50 sm:text-2xl">
              {opportunity.title}
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-400 sm:text-base">
              {opportunity.company}
            </p>
          </div>

          {/* Match estimate */}

          <div
            role="img"
            aria-label={`Atlas match estimate: ${matchScore} out of 100`}
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#22d3ee ${scoreDegrees}deg, rgba(51, 65, 85, 0.65) ${scoreDegrees}deg)`,
            }}
          >
            <div className="absolute inset-[6px] rounded-full bg-slate-950" />

            <div className="relative text-center">
              <p className="text-xl font-bold text-white">
                {matchScore}
              </p>

              <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                Estimate
              </p>
            </div>
          </div>
        </div>

        {/* Opportunity details */}

        <div className="mt-5 flex flex-wrap gap-2">
          {opportunity.remote && (
            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-300">
              🌍 Remote
            </span>
          )}

          {!opportunity.remote &&
            opportunity.location && (
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300">
                📍 {opportunity.location}
              </span>
            )}

          {opportunity.salary && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              {opportunity.salary}
            </span>
          )}

          {(opportunity.tags ?? [])
            .slice(0, 4)
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
        </div>

        {/* Atlas recommendation */}

        <section className="mt-6 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.09] to-slate-950/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-cyan-300">
              <CompassIcon />

              <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                Atlas Match Estimate
              </p>
            </div>

            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              {insight.level}
            </span>
          </div>

          <h3 className="mt-5 text-sm font-semibold text-white">
            Why Atlas surfaced this
          </h3>

          {reasons.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {reasons
                .slice(0, 3)
                .map((reason, index) => (
                  <li
                    key={`${reason}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span className="mt-1 text-emerald-300">
                      <CheckIcon />
                    </span>

                    <span>{reason}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Atlas found general signals that make
              this opportunity worth investigating.
            </p>
          )}

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-slate-500">
              Estimated career-readiness gain
            </p>

            <p className="mt-1 font-semibold text-cyan-300">
              +{insight.readinessGain}%
            </p>
          </div>
        </section>

        {/* Missing skills */}

        {missingSkills.length > 0 && (
          <section className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Skills to investigate
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {missingSkills
                .slice(0, 3)
                .map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Action center */}

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Opportunity actions
          </p>

          <div className="flex flex-wrap items-stretch gap-3">
            <Link
              href={decisionHref}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15 hover:text-cyan-100"
            >
              <CompassIcon />

              Atlas Decision
            </Link>

            <SaveOpportunityButton
              opportunity={opportunity}
            />

            <ApplyOpportunityButton
              opportunity={opportunity}
            />

            {opportunity.url && (
              <a
                href={opportunity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/10"
              >
                <ExternalLinkIcon />

                Original
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}