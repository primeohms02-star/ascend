"use client";

import Link from "next/link";

import { useAuth } from "@clerk/nextjs";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Compass,
  Sparkles,
} from "lucide-react";

const signals = [
  "Discover your direction",
  "Receive strategic missions",
  "Evaluate real opportunities",
];

export default function Hero() {
  const { isLoaded, userId } =
    useAuth();

  /*
   * Signed-out visitors begin with account creation.
   * Signed-in users can revisit onboarding whenever
   * they need to redefine their direction.
   */
  const primaryHref = userId
    ? "/onboarding"
    : "/sign-up";

  return (
    <section className="relative flex min-h-screen overflow-hidden bg-[#05070B] px-6 pb-24 pt-36 text-white">
      {/* Ambient background */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/3 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[160px]" />

        <div className="absolute -right-48 top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
        {/* Main message */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            <Sparkles
              size={15}
              aria-hidden="true"
            />

            <span>
              An Operating System for Human Potential
            </span>
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Turn uncertainty
            <br />

            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              into direction.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
            ASCEND understands where you are,
            helps you define where you are going,
            and turns that direction into missions,
            opportunities and measurable progress.
          </p>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {signals.map(
              (signal) => (
                <div
                  key={signal}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                  <span>
                    {signal}
                  </span>
                </div>
              )
            )}
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.6,
            }}
            className="mt-11 flex flex-col gap-4 sm:flex-row"
          >
            {isLoaded ? (
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow-[0_0_35px_rgba(37,99,235,0.32)] transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Start Your Journey

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <div className="h-14 w-52 animate-pulse rounded-2xl bg-blue-600/40" />
            )}

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-semibold text-slate-200 backdrop-blur-xl transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white"
            >
              See How ASCEND Works
            </a>
          </motion.div>

          {isLoaded && userId ? (
            <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500">
              Your direction can evolve. Revisit
              onboarding anytime to redefine your
              goal, update your North Star, and
              receive a new mission from Atlas.
            </p>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Start free. Build your Compass in minutes.
            </p>
          )}
        </motion.div>

        {/* Compass visualization */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            rotate: -5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.15,
            duration: 0.9,
          }}
          className="relative mx-auto hidden w-full max-w-[520px] lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-8 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative aspect-square rounded-full border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-slate-950/90 to-cyan-500/10 p-7 shadow-[0_0_100px_rgba(37,99,235,0.2)] backdrop-blur-xl">
            <div className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-slate-950/80 p-8">
              <div className="relative flex h-full w-full items-center justify-center rounded-full border border-blue-400/20">
                <span className="absolute top-5 text-sm font-bold tracking-[0.3em] text-blue-300">
                  N
                </span>

                <span className="absolute bottom-5 text-sm font-bold tracking-[0.3em] text-slate-600">
                  S
                </span>

                <span className="absolute left-5 text-sm font-bold tracking-[0.3em] text-slate-600">
                  W
                </span>

                <span className="absolute right-5 text-sm font-bold tracking-[0.3em] text-slate-600">
                  E
                </span>

                <div className="absolute h-[72%] w-px bg-gradient-to-b from-blue-300 via-blue-500 to-slate-700" />

                <div className="absolute h-px w-[72%] bg-gradient-to-r from-slate-700 via-blue-500 to-slate-700" />

                <motion.div
                  animate={{
                    rotate: [
                      -8,
                      7,
                      -4,
                      0,
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-48 w-48 items-center justify-center"
                >
                  <div className="absolute h-48 w-4 rounded-full bg-gradient-to-b from-cyan-300 via-blue-500 to-slate-700 shadow-[0_0_28px_rgba(34,211,238,0.5)] [clip-path:polygon(50%_0%,100%_48%,62%_50%,50%_100%,38%_50%,0%_48%)]" />

                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-blue-300/40 bg-slate-950 shadow-[0_0_30px_rgba(59,130,246,0.55)]">
                    <Compass
                      size={28}
                      className="text-cyan-300"
                    />
                  </div>
                </motion.div>

                <div className="absolute -bottom-8 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Direction found
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}