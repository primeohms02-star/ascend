"use client";

import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, Music2, Search } from "lucide-react";

type Props = {
  onNext: () => void;
};

const tools = [
  {
    icon: Search,
    title: "Explore",
    description: "Discover opportunities ranked around your direction, preferences and current profile.",
    accent: "text-cyan-300 border-cyan-400/20 bg-cyan-400/[0.06]",
  },
  {
    icon: BriefcaseBusiness,
    title: "ASCEND Work",
    description: "Apply for reviewed Paid Missions and turn approved work into verified experience.",
    accent: "text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]",
  },
  {
    icon: Music2,
    title: "ASCEND Music",
    description: "Use a specialist pathway for music direction, guidance and relevant opportunities.",
    accent: "text-violet-300 border-violet-400/20 bg-violet-400/[0.06]",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress",
    description: "Build visible evidence of momentum from missions, milestones and verified work.",
    accent: "text-blue-300 border-blue-400/20 bg-blue-400/[0.06]",
  },
];

export default function StepToolkit({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl"
    >
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Your ASCEND Toolkit
        </p>
        <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
          More than direction.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          Your Compass and Atlas work alongside these tools to help you discover, act and build evidence of growth.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <article key={tool.title} className={`rounded-2xl border p-5 ${tool.accent}`}>
              <Icon size={23} aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-white">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-5 text-slate-500">
        Paid Mission access does not guarantee selection or income. Every published mission is reviewed and shows its payment and requirements.
      </p>

      <div className="text-center">
        <button
          type="button"
          onClick={onNext}
          className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-9 py-4 text-base font-semibold text-white transition hover:bg-blue-500"
        >
          See My Starting Point
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
