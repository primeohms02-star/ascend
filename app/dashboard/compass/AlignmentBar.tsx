"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

type AlignmentBarProps = {
  alignment: number;
};

export default function AlignmentBar({
  alignment,
}: AlignmentBarProps) {
  const reduceMotion =
    useReducedMotion();

  const safeAlignment =
    Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(
          alignment
        )
          ? alignment
          : 0
      )
    );

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Current level progress
        </span>

        <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm font-bold text-cyan-300 shadow-[0_0_18px_rgba(59,130,246,0.12)]">
          {Math.round(
            safeAlignment
          )}
          % level progress
        </span>
      </div>

      <div
        className="relative h-4 w-full overflow-hidden rounded-full border border-white/[0.07] bg-[#03060C] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.025)]"
        role="progressbar"
        aria-label="Current Ascension level progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(
          safeAlignment
        )}
      >
        {/* Metallic track */}

        <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 via-slate-950 to-black" />

        {/* Precision divisions */}

        <div className="absolute inset-0 flex justify-between px-[20%]">
          <span className="h-full w-px bg-white/[0.055]" />

          <span className="h-full w-px bg-white/[0.055]" />

          <span className="h-full w-px bg-white/[0.055]" />

          <span className="h-full w-px bg-white/[0.055]" />
        </div>

        {/* Progress illumination */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  width: 0,
                }
          }
          animate={{
            width: `${safeAlignment}%`,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 1.7,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 shadow-[0_0_24px_rgba(59,130,246,0.75)]"
        >
          {/* Inner metallic highlight */}

          <div className="absolute inset-x-0 top-0 h-px bg-white/55" />

          {/* Restrained moving shine */}

          {!reduceMotion && (
            <motion.div
              animate={{
                x: [
                  "-130%",
                  "330%",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
          )}
        </motion.div>

        {/* Current position marker */}

        {safeAlignment >
          0 && (
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={{
              left: `${safeAlignment}%`,
              opacity: 1,
            }}
            transition={{
              duration:
                reduceMotion
                  ? 0
                  : 1.7,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="absolute top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(165,243,252,0.95)]"
          />
        )}
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>
          Beginning
        </span>

        <span>
          Building
        </span>

        <span>
          Advancing
        </span>
      </div>
    </div>
  );
}