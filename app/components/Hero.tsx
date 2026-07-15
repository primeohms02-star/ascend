"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen items-center justify-center px-6"
    >
      <div className="mx-auto max-w-4xl text-center">

        <p className="mb-6 text-sm uppercase tracking-[0.4em] text-gray-500">
          Welcome to ASCEND
        </p>

        <h1 className="text-5xl font-bold leading-tight md:text-7xl">
          Your life doesn't
          <br />
          come with a map.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-gray-600">
          ASCEND helps you understand where you are, discover opportunities,
          and confidently decide what to do next.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

          <Link href="/onboarding">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-black px-8 py-4 text-lg font-semibold text-white transition hover:bg-gray-800"
            >
              Start Your Journey
            </motion.button>
          </Link>

          <a href="#features">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Explore How It Works
            </motion.button>
          </a>

        </div>

      </div>
    </motion.section>
  );
}