"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#05070B] px-6 py-32">

      {/* Background Glow */}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Your Journey Starts Here
        </p>

        <h2 className="text-5xl font-black leading-tight text-white md:text-6xl">
          Your future
          <br />
          isn't waiting
          <br />
          for you.
        </h2>

        <h3 className="mt-4 text-3xl font-semibold text-blue-400 md:text-4xl">
          It's waiting to be built.
        </h3>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
          Millions of people have potential.
          Few have direction.
          ASCEND gives you both.
        </p>

        <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">

          <Link
            href="/onboarding"
            className="rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Start Your Journey →
          </Link>

          <Link
            href="#features"
            className="rounded-2xl border border-white/15 bg-white/5 px-10 py-4 text-lg font-medium text-white backdrop-blur-md transition hover:bg-white/10"
          >
            Explore ASCEND
          </Link>

        </div>
      </motion.div>

    </section>
  );
}