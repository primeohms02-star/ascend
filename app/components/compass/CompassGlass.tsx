"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

export default function CompassGlass() {
  const reduceMotion =
    useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
    >
      {/* Transparent curved glass surface */}

      <div className="absolute inset-[2.5%] rounded-full border border-white/[0.08] bg-[radial-gradient(circle_at_38%_28%,rgba(255,255,255,0.08),rgba(125,211,252,0.025)_24%,transparent_55%)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.12),inset_0_-20px_45px_rgba(0,0,0,0.38)]" />

      {/* Upper curved reflection */}

      <div className="absolute left-[16%] top-[9%] h-[25%] w-[68%] rotate-[-8deg] rounded-[50%] bg-gradient-to-b from-white/[0.14] via-white/[0.035] to-transparent blur-[1px] [clip-path:ellipse(50%_38%_at_50%_50%)]" />

      {/* Sharp upper glass highlight */}

      <div className="absolute left-[27%] top-[11%] h-[2.2%] w-[46%] rotate-[-7deg] rounded-full bg-white/25 blur-[3px]" />

      {/* Left-side reflection */}

      <div className="absolute left-[10%] top-[22%] h-[43%] w-[17%] rotate-[9deg] rounded-full bg-gradient-to-r from-white/[0.08] to-transparent blur-xl" />

      {/* Right cyan reflection */}

      <div className="absolute right-[7%] top-[25%] h-[38%] w-[10%] rounded-full bg-cyan-300/[0.045] blur-xl" />

      {/* Moving restrained light sweep */}

      <motion.div
        className="absolute bottom-[-15%] left-[-40%] top-[-15%] w-[22%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent blur-md"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [
                  "-40%",
                  "700%",
                ],
                opacity: [
                  0,
                  0.7,
                  0,
                ],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatDelay: 7,
          ease: "easeInOut",
        }}
      />

      {/* Inner glass rim */}

      <div className="absolute inset-[4%] rounded-full border border-white/[0.055] shadow-[inset_0_0_24px_rgba(255,255,255,0.035),0_0_2px_rgba(148,163,184,0.3)]" />

      {/* Lower edge refraction */}

      <div className="absolute bottom-[7%] left-1/2 h-[5%] w-[48%] -translate-x-1/2 rounded-full bg-blue-400/[0.035] blur-lg" />

      {/* Small realistic specular marks */}

      <div className="absolute left-[23%] top-[22%] h-2 w-2 rounded-full bg-white/25 blur-[1px]" />

      <div className="absolute left-[27%] top-[19%] h-1 w-1 rounded-full bg-white/40" />
    </div>
  );
}