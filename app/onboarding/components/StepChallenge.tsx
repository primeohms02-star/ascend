"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

type Props = {
  value: string[];

  onChange: (
    challenges: string[]
  ) => void;

  onNext: () => void;
};

const challenges = [
  "I don't know where to start",
  "I don't have a clear plan",
  "I lack the required skills",
  "I lack relevant experience",
  "I struggle to find the right opportunities",
  "I am unsure which direction fits me",
  "I procrastinate",
  "I lose motivation",
  "I feel overwhelmed",
  "I lack confidence",
  "I don't have enough funding",
  "I need a stronger network",
  "I need mentorship or guidance",
  "I struggle to stay consistent",
];

export default function StepChallenge({
  value,
  onChange,
  onNext,
}: Props) {
  function toggle(
    challenge: string
  ) {
    if (value.includes(challenge)) {
      onChange(
        value.filter(
          (item) =>
            item !== challenge
        )
      );

      return;
    }

    onChange([
      ...value,
      challenge,
    ]);
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
      <div className="mb-7 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
          Biggest Challenges
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]">
          What&apos;s holding you back?
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Select every challenge Atlas should consider.
        </p>
      </div>

      <div className="grid max-h-[58vh] gap-3 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
        {challenges.map(
          (challenge) => {
            const active =
              value.includes(
                challenge
              );

            return (
              <button
                key={challenge}
                type="button"
                onClick={() =>
                  toggle(challenge)
                }
                aria-pressed={
                  active
                }
                className={`rounded-xl border p-4 text-left text-sm transition ${
                  active
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/40 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    {challenge}
                  </span>

                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                      active
                        ? "border-blue-400 bg-blue-500 text-white"
                        : "border-white/20 text-transparent"
                    }`}
                  >
                    <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </span>
              </button>
            );
          }
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {value.length} selected
        </p>

        <button
          type="button"
          onClick={onNext}
          disabled={
            value.length === 0
          }
          className="rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            Continue
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </button>
      </div>
    </motion.div>
  );
}