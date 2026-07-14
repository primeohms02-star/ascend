"use client";

import { motion } from "framer-motion";

type Props = {
  onNext: () => void;
};

const goals = [
  {
    emoji: "💼",
    title: "Find a Career",
    description: "Land internships, jobs and career opportunities.",
  },
  {
    emoji: "🚀",
    title: "Build a Business",
    description: "Start and grow a successful company.",
  },
  {
    emoji: "📚",
    title: "Learn New Skills",
    description: "Develop valuable skills that move you forward.",
  },
  {
    emoji: "⚡",
    title: "Become More Productive",
    description: "Build better habits and accomplish more.",
  },
  {
    emoji: "🧭",
    title: "Discover My Purpose",
    description: "Find clarity and direction for your future.",
  },
];

export default function StepGoal({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12 text-center">

        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Your Goal
        </p>

        <h2 className="text-4xl font-bold text-white">
          What do you want to achieve?
        </h2>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {goals.map((goal) => (
          <button
            key={goal.title}
            onClick={onNext}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-white/10"
          >
            <div className="mb-5 text-4xl">
              {goal.emoji}
            </div>

            <h3 className="mb-3 text-2xl font-semibold text-white">
              {goal.title}
            </h3>

            <p className="leading-7 text-slate-400">
              {goal.description}
            </p>

          </button>
        ))}

      </div>

    </motion.div>
  );
}