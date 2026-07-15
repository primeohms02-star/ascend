"use client";

import { motion } from "framer-motion";

type AlignmentBarProps = {
  alignment: number;
};

export default function AlignmentBar({
  alignment,
}: AlignmentBarProps) {
  return (
    <div className="w-full">

      <div className="mb-4 flex items-center justify-between">

        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          North Star Alignment
        </span>

        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-bold text-cyan-300">
          {alignment}% Aligned
        </span>

      </div>

      <div className="relative h-5 w-full overflow-hidden rounded-full border border-white/5 bg-slate-900 shadow-inner">

        {/* Background Glow */}

        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />

        {/* Progress */}

        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${alignment}%`,
          }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
          }}
          className="relative h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 shadow-[0_0_30px_rgba(59,130,246,0.8)]"
        >

          {/* Animated Shine */}

          <motion.div
            animate={{
              x: ["-120%", "280%"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          />

        </motion.div>

      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">

        <span>Lost</span>

        <span>Focused</span>

        <span>Aligned</span>

      </div>

    </div>
  );
}