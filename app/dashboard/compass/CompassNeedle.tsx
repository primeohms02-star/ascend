"use client";

import { motion } from "framer-motion";

type CompassNeedleProps = {
  alignment: number;
};

export default function CompassNeedle({
  alignment,
}: CompassNeedleProps) {
  // 100% alignment = perfectly centered.
  // Lower alignment = slight drift.

  const rotation = (100 - alignment) * 0.4;

  return (
    <div className="relative flex items-center justify-center">

      {/* Compass Ring */}

      <div className="flex h-52 w-52 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">

        <div className="relative h-40 w-40 rounded-full border border-white/10">

          {/* Cardinal Directions */}

          <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-semibold tracking-widest text-orange-300">
            N
          </span>

          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-400">
            S
          </span>

          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            W
          </span>

          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            E
          </span>

          {/* Needle */}

          <motion.div
            animate={{
              rotate: rotation,
            }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 h-28 w-1 -translate-x-1/2 -translate-y-full origin-bottom"
          >
            <div className="h-20 rounded-full bg-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.7)]" />

            <div className="mx-auto h-8 w-3 rounded-b-full bg-slate-200" />
          </motion.div>

          {/* Center Hub */}

          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-orange-400 shadow-lg" />

        </div>

      </div>

    </div>
  );
}