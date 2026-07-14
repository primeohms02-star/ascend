"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function StepComplete() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl text-center"
    >
      <div className="mb-10 text-7xl">
        🧭
      </div>

      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
        You're Ready
      </p>

      <h1 className="text-5xl font-black text-white md:text-6xl">
        Welcome to
        <br />
        ASCEND
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
        Your journey begins today.
        Every decision, every habit and every opportunity will now
        move you closer to your North Star.
      </p>

      <Link
        href="/dashboard"
        className="mt-14 inline-flex rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
      >
        Enter ASCEND →
      </Link>
    </motion.div>
  );
}