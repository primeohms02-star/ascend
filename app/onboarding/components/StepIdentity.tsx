"use client";

import { motion } from "framer-motion";

type Props = {
  value: string;

  onSelect: (identity: string) => void;

  onNext: () => void;
};

const options = [
  {
    emoji: "🎓",
    title: "Student",
    description:
      "Learning, building experience and preparing for future opportunities.",
  },
  {
    emoji: "🌱",
    title: "Recent Graduate",
    description:
      "Starting your professional journey and looking for direction.",
  },
  {
    emoji: "🔎",
    title: "Job Seeker",
    description:
      "Actively pursuing jobs, internships and career opportunities.",
  },
  {
    emoji: "📈",
    title: "Early-Career Professional",
    description:
      "Building skills, credibility and momentum in your career.",
  },
  {
    emoji: "💼",
    title: "Experienced Professional",
    description:
      "Advancing into greater responsibility, impact or leadership.",
  },
  {
    emoji: "🔄",
    title: "Career Changer",
    description:
      "Preparing to move into a new role, industry or professional path.",
  },
  {
    emoji: "🧑‍💻",
    title: "Freelancer",
    description:
      "Building an independent career through projects and clients.",
  },
  {
    emoji: "🚀",
    title: "Founder or Entrepreneur",
    description:
      "Building a business, venture or solution that creates value.",
  },
  {
    emoji: "🎨",
    title: "Creator",
    description:
      "Growing through design, writing, media, art or digital creation.",
  },
  {
    emoji: "🔬",
    title: "Researcher or Academic",
    description:
      "Pursuing research, scholarships, fellowships and academic impact.",
  },
  {
    emoji: "🌍",
    title: "Social Impact Professional",
    description:
      "Working toward community, nonprofit or development impact.",
  },
  {
    emoji: "🛠️",
    title: "Skilled or Technical Professional",
    description:
      "Developing practical expertise in a technical or skilled field.",
  },
  {
    emoji: "🧭",
    title: "Exploring",
    description:
      "Still discovering which direction and opportunities fit you best.",
  },
];

export default function StepIdentity({
  value,
  onSelect,
  onNext,
}: Props) {
  function selectIdentity(
    identity: string
  ) {
    onSelect(identity);
  }

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
          Tell us about yourself
        </p>

        <h2 className="text-4xl font-bold text-white">
          Which best describes you?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Atlas uses this to understand your current
          stage—not to limit where you can go.
        </p>
      </div>

      <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-2 md:grid-cols-2">
        {options.map((option) => {
          const active =
            value === option.title;

          return (
            <button
              key={option.title}
              type="button"
              onClick={() =>
                selectIdentity(
                  option.title
                )
              }
              aria-pressed={active}
              className={`rounded-3xl border p-6 text-left transition-all duration-300 ${
                active
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-white/10 bg-white/5 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/10"
              }`}
            >
              <div className="mb-4 text-3xl">
                {option.emoji}
              </div>

              <h3 className="mb-2 text-xl font-semibold text-white">
                {option.title}
              </h3>

              <p className="text-sm leading-6 text-slate-400">
                {option.description}
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