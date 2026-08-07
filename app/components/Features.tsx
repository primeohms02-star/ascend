"use client";

import {
  motion,
} from "framer-motion";

import {
  Compass,
  Globe2,
  History,
  Orbit,
  Target,
  TrendingUp,
} from "lucide-react";

const systems = [
  {
    icon: Compass,
    name: "Compass",
    label: "Direction",
    description:
      "Define your North Star from your identity, goals, challenges and vision for the future.",
    outcome:
      "Know where you are going.",
    accent:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    glow:
      "group-hover:shadow-blue-500/10",
  },
  {
    icon: Orbit,
    name: "Atlas",
    label: "Intelligence",
    description:
      "Think through difficult decisions with a strategic system that understands your live direction and progress.",
    outcome:
      "Make stronger decisions.",
    accent:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    glow:
      "group-hover:shadow-cyan-500/10",
  },
  {
    icon: Target,
    name: "Strategic Missions",
    label: "Action",
    description:
      "Turn your North Star into one concrete mission that produces visible evidence of progress.",
    outcome:
      "Know what to do next.",
    accent:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    glow:
      "group-hover:shadow-amber-500/10",
  },
  {
    icon: Globe2,
    name: "Opportunities",
    label: "Possibility",
    description:
      "Explore possibilities beyond ASCEND, including programmes, funding, roles, communities, creative paths, business and more.",
    outcome:
      "Find paths worth pursuing.",
    accent:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    glow:
      "group-hover:shadow-emerald-500/10",
  },
  {
    icon: TrendingUp,
    name: "Momentum",
    label: "Growth",
    description:
      "Track completed missions, progress, streaks and Ascension levels as your actions compound.",
    outcome:
      "See yourself moving forward.",
    accent:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    glow:
      "group-hover:shadow-violet-500/10",
  },
  {
    icon: History,
    name: "Atlas Memory",
    label: "Continuity",
    description:
      "Preserve meaningful milestones, reflections and evidence so ASCEND can understand your evolving journey.",
    outcome:
      "Build with continuity.",
    accent:
      "border-rose-400/20 bg-rose-400/10 text-rose-300",
    glow:
      "group-hover:shadow-rose-500/10",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#05070B] px-6 py-20 sm:py-24"
    >
      {/* Ambient decoration */}

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
            The ASCEND System
          </p>

          <h2
            id="features-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
          >
            Direction becomes
            <br />

            <span className="text-blue-300">
              a system for growth.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            ASCEND connects the parts of personal
            progress that are usually scattered
            across different apps, conversations
            and unfinished plans.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {systems.map(
            (
              system,
              index
            ) => {
              const Icon =
                system.icon;

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
                    delay:
                      index * 0.07,
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
                        <Icon
                          size={21}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {system.label}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-white">
                      {system.name}
                    </h3>

                    <p className="mt-3 min-h-20 text-sm leading-6 text-slate-400">
                      {
                        system.description
                      }
                    </p>

                    <div className="mt-5 border-t border-white/[0.08] pt-4">
                      <p className="flex items-center gap-3 text-sm font-medium text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                        {
                          system.outcome
                        }
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            }
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-blue-400/15 bg-gradient-to-r from-blue-500/[0.08] via-cyan-500/[0.05] to-transparent px-5 py-5 text-center">
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            These systems share one live
            understanding of your journey—so your
            mission, opportunities and guidance
            move in the same direction.
          </p>
        </div>
      </div>
    </section>
  );
}