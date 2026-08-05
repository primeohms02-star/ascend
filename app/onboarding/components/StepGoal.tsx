"use client";

import { motion } from "framer-motion";

type Props = {
  value: string;

  onSelect: (goal: string) => void;

  onNext: () => void;
};

const goals = [
  {
    emoji: "💼",
    title: "Find a Job",
    description:
      "Find employment that matches your skills, interests and direction.",
  },
  {
    emoji: "🌱",
    title: "Find an Internship",
    description:
      "Build practical experience and strengthen your professional readiness.",
  },
  {
    emoji: "🎓",
    title: "Win a Scholarship",
    description:
      "Find funding for education, research or professional development.",
  },
  {
    emoji: "🌍",
    title: "Join a Fellowship",
    description:
      "Access leadership, research and professional growth programmes.",
  },
  {
    emoji: "💰",
    title: "Find Grants or Funding",
    description:
      "Discover funding for a project, business, research or social initiative.",
  },
  {
    emoji: "🚀",
    title: "Build a Business",
    description:
      "Start, validate or grow a business that creates meaningful value.",
  },
  {
    emoji: "🏦",
    title: "Build a Finance Career",
    description:
      "Find opportunities and build skills across banking, accounting, investment or finance.",
  },
  {
    emoji: "👗",
    title: "Grow in Fashion",
    description:
      "Develop your fashion craft, brand, portfolio and access relevant industry opportunities.",
  },
  {
    emoji: "🛠️",
    title: "Learn New Skills",
    description:
      "Build valuable abilities that improve your future opportunities.",
  },
  {
    emoji: "🔄",
    title: "Change Careers",
    description:
      "Prepare for a deliberate transition into a new professional path.",
  },
  {
    emoji: "📈",
    title: "Advance My Career",
    description:
      "Earn greater responsibility, income, influence or leadership.",
  },
  {
    emoji: "🧑‍💻",
    title: "Grow My Freelance Career",
    description:
      "Build a stronger portfolio, find clients and grow independent income.",
  },
  {
    emoji: "🎨",
    title: "Grow as a Creator",
    description:
      "Develop your craft, audience, portfolio and creative opportunities.",
  },
  {
    emoji: "🤝",
    title: "Build My Network",
    description:
      "Create valuable professional relationships, mentorships and partnerships.",
  },
  {
    emoji: "🧭",
    title: "Discover My Purpose",
    description:
      "Gain clarity about who you are and what direction fits you best.",
  },
];

export default function StepGoal({
  value,
  onSelect,
  onNext,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 40,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <div className="mb-10 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Your Goal
        </p>

        <h2 className="text-4xl font-bold text-white">
          What do you want to achieve?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Choose the outcome that matters most to you
          right now.
        </p>
      </div>

      <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-2 md:grid-cols-2">
        {goals.map((goal) => {
          const active =
            value === goal.title;

          return (
            <button
              key={goal.title}
              type="button"
              onClick={() =>
                onSelect(goal.title)
              }
              aria-pressed={active}
              className={`rounded-3xl border p-6 text-left transition-all duration-300 ${
                active
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-white/10 bg-white/5 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/10"
              }`}
            >
              <div className="mb-4 text-3xl">
                {goal.emoji}
              </div>

              <h3 className="mb-2 text-xl font-semibold text-white">
                {goal.title}
              </h3>

              <p className="text-sm leading-6 text-slate-400">
                {goal.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!value}
          className="rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
}
