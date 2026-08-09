"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Compass,
  DollarSign,
  GraduationCap,
  Globe2,
  Handshake,
  Landmark,
  Laptop,
  Palette,
  RefreshCw,
  Rocket,
  Shirt,
  Sprout,
  TrendingUp,
  Wrench,
} from "lucide-react";

type Props = {
  value: string;
  onSelect: (goal: string) => void;
  onNext: () => void;
};

const goals = [
  {
    icon: Compass,
    title: "Discover My Purpose",
    description:
      "Gain clarity about who you are, what matters and what direction fits you best.",
  },
  {
    icon: Wrench,
    title: "Learn New Skills",
    description:
      "Build valuable abilities that strengthen the future you are creating.",
  },
  {
    icon: Rocket,
    title: "Build a Business",
    description:
      "Start, validate or grow a business, venture or project that creates meaningful value.",
  },
  {
    icon: Palette,
    title: "Grow as a Creator",
    description:
      "Develop your craft, body of work, audience and creative opportunities.",
  },
  {
    icon: DollarSign,
    title: "Find Grants or Funding",
    description:
      "Discover funding for a project, business, research, creative work or social initiative.",
  },
  {
    icon: Handshake,
    title: "Build My Network",
    description:
      "Create valuable relationships, mentorships, communities and partnerships.",
  },
  {
    icon: GraduationCap,
    title: "Win a Scholarship",
    description:
      "Find funding for education, research or professional development.",
  },
  {
    icon: Globe2,
    title: "Join a Fellowship",
    description:
      "Access leadership, research, community and growth programmes.",
  },
  {
    icon: Sprout,
    title: "Find an Internship",
    description:
      "Build practical experience and strengthen your readiness for what comes next.",
  },
  {
    icon: Briefcase,
    title: "Find a Job",
    description:
      "Find employment that matches your skills, interests and direction.",
  },
  {
    icon: Landmark,
    title: "Build a Finance Career",
    description:
      "Find opportunities and build skills across banking, accounting, investment or finance.",
  },
  {
    icon: Shirt,
    title: "Grow in Fashion",
    description:
      "Develop your fashion craft, brand, portfolio and access relevant industry opportunities.",
  },
  {
    icon: Laptop,
    title: "Grow My Freelance Career",
    description:
      "Build a stronger portfolio, find clients and grow independent income.",
  },
  {
    icon: RefreshCw,
    title: "Change Careers",
    description:
      "Prepare for a deliberate transition into a new professional path.",
  },
  {
    icon: TrendingUp,
    title: "Advance My Career",
    description:
      "Earn greater responsibility, income, influence or leadership.",
  },
];

export default function StepGoal({
  value,
  onSelect,
  onNext,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-7 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
          Your Goal
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]">
          What do you want to achieve?
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-400">
          Choose the outcome that matters most to you
          right now.
        </p>
      </div>

      <div className="grid max-h-[62vh] gap-3 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const active = value === goal.title;
          const Icon = goal.icon;

          return (
            <button
              key={goal.title}
              type="button"
              onClick={() => onSelect(goal.title)}
              aria-pressed={active}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                active
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-white/10"
              }`}
            >
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${
                  active
                    ? "border-blue-400/40 bg-blue-500/15 text-blue-200"
                    : "border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <h3 className="mb-1.5 text-base font-semibold leading-6 text-white">
                {goal.title}
              </h3>

              <p className="text-xs leading-5 text-slate-400">
                {goal.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!value}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
