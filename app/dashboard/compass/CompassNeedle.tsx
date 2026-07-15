"use client";

import { motion } from "framer-motion";

type CompassNeedleProps = {
  alignment: number;
};

export default function CompassNeedle({
  alignment,
}: CompassNeedleProps) {
  // Perfect alignment = 0°
  const rotation = (100 - alignment) * 0.35;

  return (
    <div className="relative flex items-center justify-center">

      {/* Outer Glow */}

      <div className="absolute h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Metallic Ring */}

      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-slate-700 via-slate-900 to-black shadow-[0_0_40px_rgba(0,0,0,0.6)]">

        {/* Glass Reflection */}

        <div className="absolute inset-3 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-70" />

        {/* Inner Ring */}

        <div className="absolute inset-5 rounded-full border border-white/10" />

        {/* Compass Face */}

        <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-slate-700 bg-gradient-to-br from-[#02040A] via-[#08111D] to-[#050913] shadow-inner">

          {/* Decorative Rings */}

          <div className="absolute h-44 w-44 rounded-full border border-slate-700/70" />
          <div className="absolute h-32 w-32 rounded-full border border-slate-700/60" />

          {/* Cardinal Directions */}

          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-bold tracking-[0.35em] text-blue-300">
            N
          </span>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-[0.25em] text-slate-500">
            S
          </span>

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs tracking-[0.25em] text-slate-500">
            W
          </span>

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs tracking-[0.25em] text-slate-500">
            E
          </span>

          {/* Small Tick Marks */}

          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-full"
              style={{
                transform: `rotate(${i * 15}deg)`,
              }}
            >
              <div className="mx-auto mt-2 h-2 w-[2px] rounded-full bg-slate-600" />
            </div>
          ))}

          {/* Needle */}

          <motion.div
  animate={{
    rotate: [
      rotation,
      rotation + 2,
      rotation - 2,
      rotation + 1,
      rotation,
    ],
  }}
  transition={{
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  className="absolute h-full w-full"
>
            {/* North Needle */}

            <div
              className="absolute left-1/2 top-[16%] h-[40%] w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-t from-blue-300 to-cyan-100 shadow-[0_0_18px_rgba(96,165,250,0.9)]"
            />

            {/* South Needle */}

            <div
              className="absolute bottom-[16%] left-1/2 h-[30%] w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-300 to-slate-600"
            />
          </motion.div>

          {/* Center Pivot */}

          <div className="absolute flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/40 bg-gradient-to-br from-blue-400 to-slate-200 shadow-[0_0_25px_rgba(96,165,250,0.8)]">

            <div className="h-3 w-3 rounded-full bg-white" />

          </div>

        </div>

      </div>

    </div>
  );
}