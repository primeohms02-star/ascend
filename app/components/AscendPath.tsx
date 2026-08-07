import {
  Activity,
  Brain,
  Compass,
  Footprints,
  Route,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

const path = [
  {
    name: "Purpose",
    detail: "Understand what matters.",
    icon: Sparkles,
  },
  {
    name: "North Star",
    detail: "Define your direction.",
    icon: Compass,
  },
  {
    name: "Mission",
    detail: "Choose what matters now.",
    icon: Target,
  },
  {
    name: "Action",
    detail: "Turn direction into movement.",
    icon: Footprints,
  },
  {
    name: "Momentum",
    detail: "Build visible consistency.",
    icon: Activity,
  },
  {
    name: "Memory",
    detail: "Preserve useful evidence.",
    icon: Brain,
  },
  {
    name: "Growth",
    detail: "See who you are becoming.",
    icon: Route,
  },
  {
    name: "Legacy",
    detail: "Build beyond the moment.",
    icon: Trophy,
  },
];

export default function AscendPath() {
  return (
    <section
      aria-labelledby="ascend-path-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#070A10] px-6 py-20 sm:py-24"
    >

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 sm:text-sm">
            The Human Potential Path
          </p>

          <h2
            id="ascend-path-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
          >
            Progress is more than
            <br />

            <span className="text-blue-300">
              completing a task.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            ASCEND connects the full journey—from
            discovering what matters to building
            evidence, growth and a legacy that lasts.
          </p>
        </div>

        <div className="relative mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-8">
          <div
            aria-hidden="true"
            className="absolute left-[5%] right-[5%] top-8 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent xl:block"
          />

          {path.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.name}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center sm:p-5 xl:border-transparent xl:bg-transparent xl:p-2"
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

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {step.detail}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
