"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

export default function CompassGlow() {
  const reduceMotion =
    useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {/* Wide atmospheric blue field */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  1,
                  1.06,
                  1,
                ],
                opacity: [
                  0.2,
                  0.34,
                  0.2,
                ],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[-18%] rounded-full bg-blue-600/25 blur-[90px]"
      />

      {/* Restrained cyan outer light */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  1.04,
                  1.1,
                  1.04,
                ],
                opacity: [
                  0.08,
                  0.17,
                  0.08,
                ],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[-10%] rounded-full bg-cyan-300/20 blur-[65px]"
      />

      {/* Directional north glow */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [
                  0.12,
                  0.26,
                  0.12,
                ],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-15%] h-[48%] w-[28%] -translate-x-1/2 rounded-full bg-blue-400/25 blur-[55px]"
      />

      {/* Inner sapphire halo */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [
                  0.22,
                  0.4,
                  0.22,
                ],
                boxShadow: [
                  "0 0 35px rgba(59,130,246,0.18)",
                  "0 0 58px rgba(59,130,246,0.34)",
                  "0 0 35px rgba(59,130,246,0.18)",
                ],
              }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[12%] rounded-full border border-blue-300/15"
      />

      {/* Subtle ground reflection */}

      <div className="absolute inset-x-[15%] bottom-[-8%] h-[18%] rounded-full bg-blue-500/15 blur-[35px]" />
    </div>
  );
}