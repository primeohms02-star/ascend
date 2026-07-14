"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onNext: () => void;
};

const challenges = [
  "I don't know where to start",
  "I procrastinate",
  "I lose motivation",
  "I feel overwhelmed",
  "I don't have a clear plan",
];

export default function StepChallenge({ onNext }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(challenge: string) {
    setSelected((prev) =>
      prev.includes(challenge)
        ? prev.filter((item) => item !== challenge)
        : [...prev, challenge]
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12 text-center">

        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Biggest Challenge
        </p>

        <h2 className="text-4xl font-bold text-white">
          What's holding you back?
        </h2>

        <p className="mt-4 text-slate-400">
          Select all that apply.
        </p>

      </div>

      <div className="space-y-4">

        {challenges.map((challenge) => {
          const active = selected.includes(challenge);

          return (
            <button
              key={challenge}
              onClick={() => toggle(challenge)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/40"
              }`}
            >
              {challenge}
            </button>
          );
        })}

      </div>

      <div className="mt-10 flex justify-end">

        <button
          onClick={onNext}
          className="rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-500"
        >
          Continue →
        </button>

      </div>
    </motion.div>
  );
}