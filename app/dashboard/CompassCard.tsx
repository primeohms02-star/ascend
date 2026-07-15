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

export default function CompassCard({
  northStar,
  alignment,
}: CompassCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#05070B] via-[#0B1220] to-[#111827] shadow-2xl"
    >
      {/* Ambient Glow */}
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Animated Background */}
      <NightSky />

      {/* Content */}
      <div className="relative z-10 p-8 lg:p-10">

        <NorthStar />

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left Side */}

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              North Star
            </p>

            <h2 className="mt-3 text-4xl font-bold leading-tight text-white">
              This Is Who
              <br />
              You're Becoming
            </h2>

            <p className="mt-8 text-sm uppercase tracking-[0.2em] text-slate-500">
              Your Vision
            </p>

            <p className="mt-3 text-3xl font-bold leading-relaxed text-blue-300">
              {northStar}
            </p>

            <div className="mt-10">
              <AlignmentBar alignment={alignment} />
            </div>

            <Link href="/atlas">
              <button className="mt-10 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500">
                Open Atlas →
              </button>
            </Link>

          </div>

          {/* Right Side */}

          <div className="flex justify-center lg:justify-center">

            <div className="scale-110 lg:scale-125">
              <CompassNeedle
                alignment={alignment}
              />
            </div>

          </div>

        </div>

        {/* Quote */}

        <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-sm">

          <p className="text-center text-lg italic leading-8 text-slate-300">
            "Every decision today shapes the person
            you'll become tomorrow."
          </p>

        </div>

      </div>

    </motion.section>
  );
}