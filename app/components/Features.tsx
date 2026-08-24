"use client";

import {
  motion,
} from "framer-motion";

import {
  Compass,
  SearchCheck,
  Target,
  TrendingUp,
} from "lucide-react";

const systems = [
  {
    icon: Compass,
    name: "Set Your Direction",
    label: "01",
    description:
      "ASCEND understands your identity, goal and challenges, then helps you define a North Star that can guide real decisions.",
    outcome:
      "Know where you are going.",
    accent:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    glow:
      "group-hover:shadow-blue-500/10",
  },
  {
    icon: Target,
    name: "Take Your Next Step",
    label: "02",
    description:
      "Atlas turns your direction into one practical mission and explains why that action matters to your journey now.",
    outcome:
      "Know what to do next.",
    accent:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    glow:
      "group-hover:shadow-cyan-500/10",
  },
  {
    icon: SearchCheck,
    name: "Find Aligned Opportunities",
    label: "03",
    description:
      "Discover programmes, roles, funding and other possibilities ranked against your direction—not shown as a generic feed.",
    outcome:
      "See what is worth pursuing.",
    accent:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
    glow:
      "group-hover:shadow-sky-500/10",
  },
  {
    icon: TrendingUp,
    name: "Build Proof of Progress",
    label: "04",
    description:
      "Completed missions, milestones and reflections become visible evidence that you are moving toward your North Star.",
    outcome:
      "See your growth becoming real.",
    accent:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    glow:
      "group-hover:shadow-violet-500/10",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#05070B] px-6 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-400">
            Four Clear Outcomes
          </p>

          <h2
            id="features-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
          >
            One connected system.
            <br />

            <span className="text-blue-300">
              No scattered experience.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Compass, Atlas, Missions, Opportunities,
            Momentum and Memory work behind one simple
            journey instead of competing for your attention.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {systems.map((system, index) => {
            const Icon = system.icon;

            return (
              <motion.article
                key={system.name}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                whileHover={{
                  y: -6,
                }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-transparent backdrop-blur-xl transition duration-300 hover:border-white/20 ${system.glow}`}
              >
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-white/[0.035] blur-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-5">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${system.accent}`}
                    >
                      <Icon size={21} aria-hidden="true" />
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {system.label}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">
                    {system.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400 xl:min-h-36">
                    {system.description}
                  </p>

                  <div className="mt-5 border-t border-white/[0.08] pt-4">
                    <p className="flex items-center gap-3 text-sm font-medium text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {system.outcome}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-blue-400/15 bg-gradient-to-r from-blue-500/[0.08] via-cyan-500/[0.05] to-transparent px-5 py-5 text-center">
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            Every outcome uses the same understanding
            of your goal—so guidance, missions,
            opportunities and progress stay aligned.
          </p>
        </div>
      </div>
    </section>
  );
}
