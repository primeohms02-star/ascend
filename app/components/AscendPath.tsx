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

const path = [
  {
    name: "Goal",
    detail: "Tell ASCEND what you want to achieve.",
    icon: Compass,
  },
  {
    name: "Mission",
    detail: "Receive one clear action suited to you.",
    icon: Target,
  },
  {
    name: "Opportunity",
    detail: "Find possibilities aligned with your direction.",
    icon: SearchCheck,
  },
  {
    name: "Progress",
    detail: "Complete missions and build visible evidence.",
    icon: TrendingUp,
  },
];

export default function AscendPath() {
  return (
    <section
      aria-labelledby="ascend-path-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#070A10] px-6 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.07] blur-[170px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 sm:text-sm">
            One Clear Journey
          </p>

          <h2
            id="ascend-path-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
          >
            One goal. One next step.
            <br />

            <span className="text-blue-300">
              Visible progress.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            ASCEND keeps the experience focused. Your
            goal guides a mission, your mission connects
            to opportunities, and every completed step
            becomes evidence of progress.
          </p>
        </div>

        <div className="relative mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent lg:block"
          />

          {path.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.name}
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
                  amount: 0.4,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                }}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center backdrop-blur-xl lg:border-transparent lg:bg-transparent lg:p-3"
              >
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-[#0A101C] text-cyan-300 shadow-[0_0_30px_rgba(37,99,235,0.12)]">
                  <Icon
                    size={21}
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-3 text-xs font-semibold text-blue-400">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-1 font-bold text-white">
                  {step.name}
                </h3>

                <p className="mx-auto mt-2 max-w-48 text-sm leading-6 text-slate-500">
                  {step.detail}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
