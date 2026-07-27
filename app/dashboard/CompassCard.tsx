"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import NightSky from "./compass/NightSky";
import NorthStar from "./compass/NorthStar";
import CompassNeedle from "./compass/CompassNeedle";
import AlignmentBar from "./compass/AlignmentBar";

type CompassCardProps = {
  northStar: string;
  alignment: number;
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

export default function CompassCard({
  northStar,
  alignment,
}: CompassCardProps) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#05070B] via-[#0B1220] to-[#111827] shadow-xl shadow-blue-950/20"
    >
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
      />

      <NightSky />
      <NorthStar />

      <div className="relative z-10 grid items-center gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
        {/* North Star content */}

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
            North Star
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Your direction:
            </h2>

            <p className="text-xl font-bold text-blue-300 sm:text-2xl">
              {northStar}
            </p>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            The future you are intentionally building through
            your missions, decisions, and opportunities.
          </p>

          <div className="mt-5 max-w-xl">
            <AlignmentBar alignment={alignment} />
          </div>

          <Link
            href="/atlas"
            className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          >
            Open Atlas

            <ArrowIcon />
          </Link>
        </div>

        {/* Compact compass */}

        <div className="hidden justify-center lg:flex">
          <div className="scale-75">
            <CompassNeedle
              alignment={alignment}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}