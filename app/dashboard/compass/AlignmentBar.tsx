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

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-300">
          Direction
        </span>

        <span className="text-sm font-semibold text-orange-300">
          {alignment}% Aligned
        </span>

      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">

        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${alignment}%`,
          }}
          transition={{
            duration: 1.6,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.6)]"
        />

      </div>

    </div>
  );
}