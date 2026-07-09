"use client";

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
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.8,
      }}
      className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl"
    >
      {/* Animated Night Sky */}

      <NightSky />

      {/* Content */}

      <div className="relative z-10 p-8">

        <NorthStar />

        <div className="pt-20">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
            Atlas
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            Stay True to Your North
          </h2>

          <p className="mt-5 text-slate-300">
            Your North Star
          </p>

          <p className="mt-2 text-2xl font-semibold text-orange-300">
            {northStar}
          </p>

        </div>

        <div className="mt-12 flex justify-center">

          <CompassNeedle
            alignment={alignment}
          />

        </div>

        <div className="mt-12">

          <AlignmentBar
            alignment={alignment}
          />

        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">

          <p className="text-center text-sm italic leading-7 text-slate-300">
            "The Compass never chooses your direction.
            <br />
            It only helps you remain faithful to it."
          </p>

        </div>

      </div>
    </motion.section>
  );
}