"use client";

import Link from "next/link";

import type { AtlasInsight } from "@/lib/atlas/opportunities/insight";

type Props = {
  insight: AtlasInsight;
  actionPlanHref: string;
};

const ACTION_PLAN_RETURN_NAVIGATION_KEY =
  "ascend:opportunities:action-plan-return";

type ScoreTheme = {
  accent: string;
  text: string;
  border: string;
  background: string;
  glow: string;
};

function getScoreTheme(score: number): ScoreTheme {
  if (score >= 80) {
    return {
      accent: "#22d3ee",
      text: "text-cyan-300",
      border: "border-cyan-400/30",
      background: "bg-cyan-400/10",
      glow: "shadow-cyan-500/10",
    };
  }

  if (score >= 65) {
    return {
      accent: "#38bdf8",
      text: "text-sky-300",
      border: "border-sky-400/30",
      background: "bg-sky-400/10",
      glow: "shadow-sky-500/10",
    };
  }

  if (score >= 45) {
    return {
      accent: "#fbbf24",
      text: "text-amber-300",
      border: "border-amber-400/30",
      background: "bg-amber-400/10",
      glow: "shadow-amber-500/10",
    };
  }

  return {
    accent: "#fb7185",
    text: "text-rose-300",
    border: "border-rose-400/30",
    background: "bg-rose-400/10",
    glow: "shadow-rose-500/10",
  };
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 13 4 4L19 7"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19a6 6 0 0 0-12 0m18 0a6 6 0 0 0-8-5.65M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

function ActionArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

function DownArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
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

export default function AtlasDecisionEngine({
  insight,
  actionPlanHref,
}: Props) {
  const theme = getScoreTheme(insight.score);

  const scoreDegrees =
    Math.max(0, Math.min(100, insight.score)) * 3.6;

  function rememberActionPlanNavigation() {
    window.sessionStorage.setItem(
      ACTION_PLAN_RETURN_NAVIGATION_KEY,
      JSON.stringify({
        decisionHref: `${window.location.pathname}${window.location.search}`,
        destination: new URL(actionPlanHref, window.location.origin).pathname,
        createdAt: Date.now(),
      }),
    );
  }

  return (
    <section
      aria-labelledby="atlas-decision-heading"
      className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 shadow-2xl shadow-cyan-950/20"
    >
      {/* Background decoration */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl"
      />

      {/* Engine header */}

      <div className="relative border-b border-white/10 px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <CompassIcon />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Atlas Decision Engine
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Instant opportunity assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs font-medium text-emerald-300">
              Analysis complete
            </span>
          </div>
        </div>
      </div>

      <div className="relative p-5 sm:p-8">
        {/* Main decision summary */}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] xl:items-stretch">
          {/* Score */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left xl:flex-col xl:text-center">
              <div
                role="img"
                aria-label={`Atlas match score: ${insight.score} out of 100`}
                className={`relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full shadow-2xl ${theme.glow}`}
                style={{
                  background: `conic-gradient(${theme.accent} ${scoreDegrees}deg, rgba(51, 65, 85, 0.55) ${scoreDegrees}deg)`,
                }}
              >
                <div className="absolute inset-[10px] rounded-full bg-slate-950" />

                <div className="relative">
                  <div className="flex items-end justify-center">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {insight.score}
                    </span>

                    <span className="mb-1.5 text-lg font-medium text-slate-500">
                      /100
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Match score
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:ml-7 sm:mt-0 xl:ml-0 xl:mt-6">
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.16em] ${theme.text}`}
                >
                  Personal alignment
                </p>

                <h2
                  id="atlas-decision-heading"
                  className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
                >
                  {insight.level}
                </h2>

                <div
                  className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${theme.border} ${theme.background}`}
                >
                  <span className="text-sm text-slate-300">
                    Growth potential
                  </span>

                  <span className={`text-sm font-semibold ${theme.text}`}>
                    {insight.growth}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended next step */}

          <div className="flex flex-col justify-between rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.12] via-slate-900/70 to-slate-900/90 p-6 sm:p-8">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
                <ArrowIcon />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Recommended next step
              </p>

              <h3 className="mt-2 text-2xl font-semibold text-white">
                Turn insight into action
              </h3>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                {insight.nextStep}
              </p>
            </div>

            <div className="mt-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={actionPlanHref}
                  prefetch
                  onClick={rememberActionPlanNavigation}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                >
                  Build My Action Plan

                  <ActionArrowIcon />
                </Link>

                <a
                  href="#opportunity-overview"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                >
                  Review Opportunity Details

                  <DownArrowIcon />
                </a>
              </div>

              <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">
                Match score measures alignment with your direction and
                preferences. It is different from application readiness,
                which checks whether your current evidence meets the role.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed analysis */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Strengths */}

          <article className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.045] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <CheckIcon />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Opportunity Strengths
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Positive signals Atlas identified
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {insight.strengths.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Considerations */}

          <article className="rounded-3xl border border-amber-400/15 bg-amber-400/[0.045] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <AlertIcon />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Things to Consider
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Details worth investigating
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {insight.considerations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Best suited for */}

          <article className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.045] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <UserIcon />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Best Suited For
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Who may benefit most
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {insight.bestFor.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
