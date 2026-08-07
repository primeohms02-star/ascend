"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Compass,
  GraduationCap,
  Globe2,
  Landmark,
  Laptop,
  Microscope,
  Palette,
  RefreshCw,
  Rocket,
  Search,
  Shirt,
  Sprout,
  TrendingUp,
  Wrench,
  ArrowRight,
} from "lucide-react";

type Props = {
  value: string;
  onSelect: (identity: string) => void;
  onNext: () => void;
};

const options = [
  {
    icon: GraduationCap,
    title: "Student",
    description:
      "Learning, building experience and preparing for future opportunities.",
  },
  {
    icon: Sprout,
    title: "Recent Graduate",
    description:
      "Starting your professional journey and looking for direction.",
  },
  {
    icon: Search,
    title: "Job Seeker",
    description:
      "Actively pursuing jobs, internships and career opportunities.",
  },
  {
    icon: TrendingUp,
    title: "Early-Career Professional",
    description:
      "Building skills, credibility and momentum in your career.",
  },
  {
    icon: Briefcase,
    title: "Experienced Professional",
    description:
      "Advancing into greater responsibility, impact or leadership.",
  },
  {
    icon: RefreshCw,
    title: "Career Changer",
    description:
      "Preparing to move into a new role, industry or professional path.",
  },
  {
    icon: Laptop,
    title: "Freelancer",
    description:
      "Building an independent career through projects and clients.",
  },
  {
    icon: Rocket,
    title: "Founder or Entrepreneur",
    description:
      "Building a business, venture or solution that creates value.",
  },
  {
    icon: Building2,
    title: "Business Professional",
    description:
      "Building expertise across strategy, operations, sales or enterprise growth.",
  },
  {
    icon: Landmark,
    title: "Finance Professional",
    description:
      "Growing through banking, accounting, investment, audit or financial analysis.",
  },
  {
    icon: Shirt,
    title: "Fashion Professional",
    description:
      "Building a career or business in fashion design, styling, textiles or apparel.",
  },
  {
    icon: Palette,
    title: "Creator",
    description:
      "Growing through design, writing, media, art or digital creation.",
  },
  {
    icon: Microscope,
    title: "Researcher or Academic",
    description:
      "Pursuing research, scholarships, fellowships and academic impact.",
  },
  {
    icon: Globe2,
    title: "Social Impact Professional",
    description:
      "Working toward community, nonprofit or development impact.",
  },
  {
    icon: Wrench,
    title: "Skilled or Technical Professional",
    description:
      "Developing practical expertise in a technical or skilled field.",
  },
  {
    icon: Compass,
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-7 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
          Tell us about yourself
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]">
          Which best describes you?
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-400">
          Atlas uses this to understand your current
          stage—not to limit where you can go.
        </p>
      </div>

      <div className="grid max-h-[62vh] gap-3 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const active = value === option.title;
          const Icon = option.icon;

          return (
            <button
              key={option.title}
              type="button"
              onClick={() => onSelect(option.title)}
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
                {option.title}
              </h3>

              <p className="text-xs leading-5 text-slate-400">
                {option.description}
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
