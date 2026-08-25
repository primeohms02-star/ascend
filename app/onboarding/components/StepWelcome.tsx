"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
        Complete your Compass so ASCEND can understand your direction,
        prepare your first mission and personalize Atlas around you.
      </p>

      <button
        onClick={onNext}
        className="mt-14 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
      >
        Begin
        <ArrowRight size={19} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
