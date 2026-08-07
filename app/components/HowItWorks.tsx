"use client";

import {
  motion,
} from "framer-motion";

import {
  Compass,
  SearchCheck,
  Target,
  TrendingUp,
  UserRoundSearch,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRoundSearch,
    label: "Understand",
    title: "Tell ASCEND where you are",
    description:
      "Share your current identity, immediate goal, challenges and the future you want to build.",
  },
  {
    number: "02",
    icon: Compass,
    label: "Direction",
    title: "Define your North Star",
    description:
      "ASCEND turns your answers into a living direction that guides missions, decisions and opportunities.",
  },
  {
    number: "03",
    icon: Target,
    label: "Action",
    title: "Receive one strategic mission",
    description:
      "Atlas chooses a concrete next action based on your direction, progress and completed mission history.",
  },
  {
    number: "04",
    icon: SearchCheck,
    label: "Decision",
    title: "Discover and evaluate opportunities",
    description:
      "Explore matched opportunities and use the Atlas Decision Engine to decide what deserves your time.",
  },
  {
    number: "05",
    icon: TrendingUp,
    label: "Evidence",
    title: "Build measurable momentum",
    description:
      "Complete missions, preserve milestones and watch consistent evidence move you through Ascension levels.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#070A10] px-6 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.07] blur-[170px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            How ASCEND Works
          </p>

          <h2
            id="how-it-works-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
          >
            From uncertainty
            <br />

            <span className="text-cyan-300">
              to evidence of growth.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            ASCEND does more than give advice. It
            connects who you are becoming to what
            you should do next—and remembers the
            progress you create.
          </p>
        </div>

        <div className="relative">
          {/* Desktop connection line */}

          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-12 hidden h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent lg:block"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {steps.map(
              (
                step,
                index
              ) => {
                const Icon =
                  step.icon;

                return (
                  <motion.article
                    key={step.number}
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
                      amount: 0.25,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index * 0.08,
                    }}
                    className="group relative"
                  >
                    <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/20 bg-[#0A101C] shadow-[0_0_35px_rgba(37,99,235,0.12)] transition group-hover:border-cyan-400/40 group-hover:shadow-[0_0_45px_rgba(34,211,238,0.18)]">
                      <Icon
                        size={26}
                        className="text-cyan-300"
                        aria-hidden="true"
                      />

                      <span className="absolute -right-2 -top-2 flex h-8 min-w-8 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500 px-2 text-[11px] font-bold text-white">
                        {
                          step.number
                        }
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center transition duration-300 group-hover:border-blue-400/20 group-hover:bg-white/[0.05]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                        {
                          step.label
                        }
                      </p>

                      <h3 className="mt-3 text-lg font-bold leading-7 text-white">
                        {
                          step.title
                        }
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {
                          step.description
                        }
                      </p>
                    </div>
                  </motion.article>
                );
              }
            )}
          </div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.2,
            duration: 0.6,
          }}
          className="mx-auto mt-10 max-w-4xl rounded-2xl border border-cyan-400/15 bg-gradient-to-r from-cyan-400/[0.07] via-blue-500/[0.08] to-cyan-400/[0.07] p-5 text-center"
        >
          <p className="text-base font-semibold text-white">
            Every completed mission creates new
            evidence.
          </p>

          <p className="mt-2 leading-7 text-slate-400">
            Atlas uses that evidence to understand
            your journey more clearly and make your
            next direction more relevant.
          </p>
        </motion.div>
      </div>
    </section>
  );
}