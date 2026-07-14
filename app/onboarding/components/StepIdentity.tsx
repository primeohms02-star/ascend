"use client";

import { motion } from "framer-motion";

type Props = {
  onNext: () => void;
};

const options = [
  {
    emoji: "🎓",
    title: "Student",
    description: "Learning and preparing for your future.",
  },
  {
    emoji: "💼",
    title: "Professional",
    description: "Growing your career and opportunities.",
  },
  {
    emoji: "🚀",
    title: "Entrepreneur",
    description: "Building businesses and creating value.",
  },
  {
    emoji: "🎨",
    title: "Creator",
    description: "Designing, writing, building or creating.",
  },
  {
    emoji: "🔍",
    title: "Exploring",
    description: "Still discovering what path fits you best.",
  },
];

export default function StepIdentity({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12 text-center">

        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Tell us about yourself
        </p>

        <h2 className="text-4xl font-bold text-white">
          Which best describes you?
        </h2>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {options.map((option) => (
          <button
            key={option.title}
            onClick={onNext}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:border-blue-500 hover:bg-white/10 hover:-translate-y-1"
          >
            <div className="mb-5 text-4xl">
              {option.emoji}
            </div>

            <h3 className="mb-3 text-2xl font-semibold text-white">
              {option.title}
            </h3>

            <p className="leading-7 text-slate-400">
              {option.description}
            </p>
          </button>
        ))}

      </div>
    </motion.div>
  );
}