"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="uppercase tracking-[0.4em] text-gray-500 text-sm mb-6">
          Welcome to ASCEND
        </p>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Your life doesn't
          <br />
          come with a map.
        </h1>

        <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-8">
          ASCEND helps you understand where you are, discover opportunities,
          and confidently decide what to do next.
        </p>

        <Link href="/compass">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 rounded-xl bg-black px-8 py-4 text-lg font-semibold text-white transition hover:bg-gray-800"
          >
            Start Your Journey
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
}