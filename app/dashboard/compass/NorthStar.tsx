"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

export default function NorthStar() {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.75,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1.2,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className="pointer-events-none absolute left-1/2 top-7 -translate-x-1/2"
      aria-hidden="true"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Wide restrained glow */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [
                    1,
                    1.3,
                    1,
                  ],
                  opacity: [
                    0.16,
                    0.32,
                    0.16,
                  ],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-28 w-28 rounded-full bg-blue-400/45 blur-[48px]"
        />

        {/* Concentrated cyan light */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [
                    1,
                    1.15,
                    1,
                  ],
                  opacity: [
                    0.38,
                    0.72,
                    0.38,
                  ],
                }
          }
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-10 w-10 rounded-full bg-cyan-200/50 blur-[18px]"
        />

        {/* Long vertical ray */}

        <div className="absolute h-20 w-px bg-gradient-to-b from-transparent via-blue-200/80 to-transparent" />

        {/* Horizontal ray */}

        <div className="absolute h-px w-20 bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />

        {/* Diagonal rays */}

        <div className="absolute h-14 w-px rotate-45 bg-gradient-to-b from-transparent via-blue-300/40 to-transparent" />

        <div className="absolute h-14 w-px -rotate-45 bg-gradient-to-b from-transparent via-blue-300/40 to-transparent" />

        {/* Premium four-point North Star */}

        <motion.svg
          viewBox="0 0 100 100"
          className="relative h-11 w-11 drop-shadow-[0_0_13px_rgba(125,211,252,0.95)]"
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: [
                    0,
                    2,
                    0,
                    -2,
                    0,
                  ],
                  scale: [
                    1,
                    1.06,
                    1,
                  ],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <defs>
            <linearGradient
              id="north-star-metal"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#FFFFFF"
              />

              <stop
                offset="30%"
                stopColor="#BFDBFE"
              />

              <stop
                offset="58%"
                stopColor="#60A5FA"
              />

              <stop
                offset="82%"
                stopColor="#E2E8F0"
              />

              <stop
                offset="100%"
                stopColor="#3B82F6"
              />
            </linearGradient>

            <radialGradient
              id="north-star-core"
            >
              <stop
                offset="0%"
                stopColor="#FFFFFF"
              />

              <stop
                offset="45%"
                stopColor="#BAE6FD"
              />

              <stop
                offset="100%"
                stopColor="#3B82F6"
              />
            </radialGradient>
          </defs>

          {/* Metallic star body */}

          <path
            d="M50 2 L58 41 L98 50 L58 59 L50 98 L42 59 L2 50 L42 41 Z"
            fill="url(#north-star-metal)"
            stroke="#E0F2FE"
            strokeOpacity="0.85"
            strokeWidth="1"
          />

          {/* Dimensional shaded side */}

          <path
            d="M50 2 L50 50 L42 41 Z"
            fill="#FFFFFF"
            opacity="0.78"
          />

          <path
            d="M98 50 L50 50 L58 41 Z"
            fill="#1D4ED8"
            opacity="0.42"
          />

          <path
            d="M50 98 L50 50 L58 59 Z"
            fill="#172554"
            opacity="0.52"
          />

          <path
            d="M2 50 L50 50 L42 59 Z"
            fill="#60A5FA"
            opacity="0.42"
          />

          {/* Sapphire centre */}

          <circle
            cx="50"
            cy="50"
            r="7"
            fill="url(#north-star-core)"
            stroke="#FFFFFF"
            strokeOpacity="0.72"
          />
        </motion.svg>

        {/* Slow calibration orbit */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute h-[72px] w-[72px] rounded-full border border-dashed border-cyan-200/10"
        >
          <div className="absolute left-1/2 top-[-2px] h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-100 shadow-[0_0_8px_white]" />

          <div className="absolute bottom-[5px] right-[8px] h-1 w-1 rounded-full bg-blue-200/80 shadow-[0_0_7px_rgba(147,197,253,0.9)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}