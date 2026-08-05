"use client";

import {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

type Props = {
  value: string[];

  onChange: (
    skills: string[]
  ) => void;

  onNext: () => void;
};

const suggestedSkills = [
  "Accounting",
  "Artificial Intelligence",
  "AWS",
  "Cloud Computing",
  "Communication",
  "Customer Service",
  "Cybersecurity",
  "Data Analysis",
  "Digital Marketing",
  "Entrepreneurship",
  "Fashion Design",
  "Fashion Styling",
  "Financial Analysis",
  "Financial Modeling",
  "Git",
  "Graphic Design",
  "JavaScript",
  "Leadership",
  "Machine Learning",
  "Microsoft Excel",
  "Node.js",
  "Power BI",
  "Problem Solving",
  "Product Management",
  "Project Management",
  "Python",
  "React",
  "Research",
  "Sales",
  "SEO",
  "Social Media Marketing",
  "SQL",
  "Technical Writing",
  "TypeScript",
  "UI/UX Design",
  "Business Strategy",
  "Investment Analysis",
];

const MAX_SKILLS = 20;

function normalizeSkill(
  skill: string
): string {
  return skill
    .trim()
    .replace(/\s+/g, " ");
}

export default function StepSkills({
  value,
  onChange,
  onNext,
}: Props) {
  const [
    customSkill,
    setCustomSkill,
  ] = useState("");

  const [
    inputError,
    setInputError,
  ] = useState("");

  function hasSkill(
    skill: string
  ) {
    const normalized =
      skill.toLowerCase();

    return value.some(
      (selectedSkill) =>
        selectedSkill.toLowerCase() ===
        normalized
    );
  }

  function toggleSkill(
    skill: string
  ) {
    setInputError("");

    if (hasSkill(skill)) {
      onChange(
        value.filter(
          (selectedSkill) =>
            selectedSkill.toLowerCase() !==
            skill.toLowerCase()
        )
      );

      return;
    }

    if (
      value.length >=
      MAX_SKILLS
    ) {
      setInputError(
        `You can select up to ${MAX_SKILLS} skills.`
      );

      return;
    }

    onChange([
      ...value,
      skill,
    ]);
  }

  function addCustomSkill() {
    setInputError("");

    const skill =
      normalizeSkill(
        customSkill
      );

    if (
      skill.length < 2
    ) {
      setInputError(
        "Enter a valid skill."
      );

      return;
    }

    if (
      skill.length > 60
    ) {
      setInputError(
        "Keep each skill under 60 characters."
      );

      return;
    }

    if (hasSkill(skill)) {
      setInputError(
        "You already selected that skill."
      );

      return;
    }

    if (
      value.length >=
      MAX_SKILLS
    ) {
      setInputError(
        `You can select up to ${MAX_SKILLS} skills.`
      );

      return;
    }

    onChange([
      ...value,
      skill,
    ]);

    setCustomSkill("");
  }

  function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    addCustomSkill();
  }

  function continueWithoutSkills() {
    onChange([]);
    onNext();
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
          Your Skills
        </p>

        <h2 className="text-4xl font-bold text-white">
          What can you already do?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Select the skills you
          currently have. Atlas will
          use them to distinguish
          realistic opportunities
          from genuine growth areas.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex flex-wrap gap-3">
          {suggestedSkills.map(
            (skill) => {
              const active =
                hasSkill(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    toggleSkill(
                      skill
                    )
                  }
                  aria-pressed={
                    active
                  }
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-blue-400 bg-blue-500/20 text-blue-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="mr-2 text-blue-300"
                    >
                      ✓
                    </span>
                  )}

                  {skill}
                </button>
              );
            }
          )}
        </div>

        <div className="my-7 h-px bg-white/10" />

        <form
          onSubmit={
            handleSubmit
          }
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only">
            Add another skill
          </label>

          <input
            type="text"
            value={customSkill}
            onChange={(
              event
            ) => {
              setCustomSkill(
                event.target.value
              );

              setInputError("");
            }}
            maxLength={60}
            placeholder="Add another skill"
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#080B12] px-5 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
          />

          <button
            type="submit"
            disabled={
              !customSkill.trim()
            }
            className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-3.5 font-semibold text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Skill
          </button>
        </form>

        {inputError && (
          <p className="mt-3 text-sm text-rose-300">
            {inputError}
          </p>
        )}
      </div>

      {value.length > 0 && (
        <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-cyan-100">
              Selected skills
            </p>

            <p className="text-xs text-cyan-300">
              {value.length} of{" "}
              {MAX_SKILLS}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {value.map(
              (skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    toggleSkill(
                      skill
                    )
                  }
                  aria-label={`Remove ${skill}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-200"
                >
                  {skill}

                  <span
                    aria-hidden="true"
                    className="ml-2 opacity-60"
                  >
                    ×
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={
            continueWithoutSkills
          }
          className="text-sm font-medium text-slate-500 transition hover:text-slate-300"
        >
          I&apos;m still discovering
          my skills
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={
            value.length === 0
          }
          className="w-full rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
}
