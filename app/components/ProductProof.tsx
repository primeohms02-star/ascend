import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";

const journey = [
  {
    icon: Compass,
    label: "Goal",
    value: "Build a career in product design",
  },
  {
    icon: Target,
    label: "Mission",
    value: "Complete one portfolio-ready UX case study",
  },
  {
    icon: BriefcaseBusiness,
    label: "Opportunity",
    value: "Review an early-career product design internship",
  },
  {
    icon: TrendingUp,
    label: "Progress",
    value: "Record the completed work as evidence",
  },
];

export default function ProductProof() {
  return (
    <section
      id="ascend-in-action"
      aria-labelledby="product-proof-heading"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.06] bg-[#05070B] px-6 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute -right-40 bottom-10 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.08] blur-[150px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 sm:text-sm">
            See ASCEND in Action
          </p>

          <h2
            id="product-proof-heading"
            className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            A goal becomes something
            <span className="block text-blue-300">
              you can do today.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Here is one example of how ASCEND turns an
            ambition into a focused mission, explains
            the reasoning, connects it to an opportunity
            and records the progress that follows.
          </p>

          <div className="mt-8 space-y-3">
            {journey.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-cyan-300">
                    <Icon size={19} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                      {String(index + 1).padStart(2, "0")} · {item.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-12 rounded-full bg-blue-500/15 blur-[110px]" />

          <article className="relative overflow-hidden rounded-[2rem] border border-blue-300/15 bg-gradient-to-br from-[#0D1728] via-[#080D16] to-[#05070B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-7">
            <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Example Journey
                </p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Product Design Direction
                </h3>
              </div>

              <span className="w-fit rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-slate-400">
                Illustrative example
              </span>
            </header>

            <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                North Star
              </p>
              <p className="mt-3 text-base font-semibold leading-7 text-white sm:text-lg">
                Become a job-ready product designer with a credible portfolio.
              </p>
            </section>

            <section className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.05] p-5">
              <div className="flex items-center gap-3">
                <Lightbulb size={19} className="text-cyan-300" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Atlas Reasoning
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                You have foundational design skills, but no finished case study that proves how you solve a real user problem.
              </p>
            </section>

            <section className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-500/[0.08] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                    Primary Mission
                  </p>
                  <h4 className="mt-3 text-lg font-bold leading-7 text-white">
                    Complete one portfolio-ready UX case study.
                  </h4>
                </div>
                <Target size={22} className="shrink-0 text-blue-300" aria-hidden="true" />
              </div>

              <div className="mt-4 border-t border-white/[0.08] pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Why this mission matters
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  A finished case study creates evidence employers can review and strengthens the applications you make next.
                </p>
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-white/[0.08] bg-slate-950/50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Matched Opportunity
                  </p>
                  <h4 className="mt-2 font-semibold text-white">
                    Junior Product Design Internship
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Early-career friendly · Portfolio-building · Remote
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  86% aligned
                </div>
              </div>
            </section>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5 text-sm">
              <span className="text-slate-500">
                Mission completed → progress recorded
              </span>
              <ArrowRight size={18} className="shrink-0 text-cyan-300" aria-hidden="true" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
