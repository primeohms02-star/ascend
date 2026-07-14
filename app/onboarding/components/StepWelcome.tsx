"use client";

import { motion } from "framer-motion";

type Props = {
  onNext: () => void;
};

export default function StepWelcome({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl"
    >
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
        Welcome to ASCEND
      </p>

      <h1 className="text-5xl font-black text-white md:text-6xl">
        Before we build
        <br />
        your future...
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
        Let's understand who you are, what you're aiming for,
        and where you want to go.
      </p>

      <button
        onClick={onNext}
        className="mt-14 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
      >
        Begin →
      </button>
    </motion.div>
  );
}