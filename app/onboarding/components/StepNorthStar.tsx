"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onNext: () => void;
};

export default function StepNorthStar({ onNext }: Props) {
  const [northStar, setNorthStar] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl"
    >
      <div className="text-center">

        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Your North Star
        </p>

        <h2 className="text-4xl font-bold text-white">
          Imagine your life
          <br />
          three years from now.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          If everything went better than expected...
          what would your life look like?
        </p>

      </div>

      <textarea
        value={northStar}
        onChange={(e) => setNorthStar(e.target.value)}
        placeholder="Describe the future you're working towards..."
        className="mt-12 h-56 w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-lg text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500"
      />

      <div className="mt-10 flex justify-end">

        <button
          onClick={onNext}
          disabled={!northStar.trim()}
          className="rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Build My Compass →
        </button>

      </div>

    </motion.div>
  );
}