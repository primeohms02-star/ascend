import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  greeting: string;
  summary: string;
  focus: string;
  focusDetail: string;
  oracle: string;
};

export default function DailyBriefingCard({
  greeting,
  summary,
  focus,
  focusDetail,
  oracle,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 text-white shadow-xl shadow-blue-950/20 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400">
              Today&apos;s Briefing
            </p>

            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {greeting}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick view of what matters today.
            </p>
          </div>

          <div className="w-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
            Today
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
          <article className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Situation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {summary}
            </p>
          </article>

          <article className="rounded-xl border border-blue-400/20 bg-blue-400/[0.055] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
              Primary Focus
            </p>

            <p className="mt-2 text-base font-semibold leading-6 text-white">
              {focus}
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-400">
              {focusDetail}
            </p>

            <Link
              href="/action#why-mission-matters"
              className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              Why this mission matters
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Atlas Noticed
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {oracle}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
