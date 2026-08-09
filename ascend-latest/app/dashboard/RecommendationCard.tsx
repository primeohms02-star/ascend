import Link from "next/link";

import type {
  Recommendation,
} from "@/lib/engine/recommendations";

type Props = {
  recommendation?: Recommendation;
};

function ArrowIcon() {
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

function DirectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19V5m0 0L7 10m5-5 5 5"
      />
    </svg>
  );
}

export default function RecommendationCard({
  recommendation,
}: Props) {
  if (!recommendation) {
    return (
      <section className="rounded-3xl border border-cyan-400/20 bg-slate-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Recommended Next
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Start your ASCEND journey
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Complete onboarding so Atlas can understand your
          identity, goal, challenges and North Star before
          preparing a strategic mission.
        </p>

        <Link
          href="/onboarding"
          className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Start Your Journey

          <ArrowIcon />
        </Link>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.09] via-slate-900/80 to-slate-950 p-6 shadow-xl shadow-cyan-950/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Recommended Next
            </p>

            <span className="mt-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
              {recommendation.category}
            </span>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
            <DirectionIcon />
          </div>
        </div>

        {/* Recommendation */}

        <h2 className="mt-5 text-xl font-semibold text-white">
          {recommendation.title}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
          {recommendation.description}
        </p>

        <Link
          href={
            recommendation.href ===
            "/compass"
              ? "/onboarding"
              : recommendation.href
          }
          className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {recommendation.href ===
          "/compass"
            ? "Start Your Journey"
            : recommendation.action}

          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}