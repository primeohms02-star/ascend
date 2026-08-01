"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

const stars = [
  {
    left: "6%",
    top: "12%",
    size: 2,
    delay: 0,
  },
  {
    left: "14%",
    top: "31%",
    size: 3,
    delay: 1.2,
  },
  {
    left: "23%",
    top: "17%",
    size: 2,
    delay: 2.1,
  },
  {
    left: "34%",
    top: "9%",
    size: 1,
    delay: 0.7,
  },
  {
    left: "43%",
    top: "26%",
    size: 3,
    delay: 1.7,
  },
  {
    left: "55%",
    top: "13%",
    size: 2,
    delay: 2.8,
  },
  {
    left: "66%",
    top: "19%",
    size: 3,
    delay: 0.4,
  },
  {
    left: "78%",
    top: "10%",
    size: 1,
    delay: 2.3,
  },
  {
    left: "91%",
    top: "23%",
    size: 2,
    delay: 1.4,
  },
  {
    left: "9%",
    top: "66%",
    size: 1,
    delay: 2.5,
  },
  {
    left: "24%",
    top: "79%",
    size: 2,
    delay: 0.9,
  },
  {
    left: "40%",
    top: "71%",
    size: 1,
    delay: 1.9,
  },
  {
    left: "55%",
    top: "83%",
    size: 3,
    delay: 0.2,
  },
  {
    left: "72%",
    top: "73%",
    size: 1,
    delay: 2.7,
  },
  {
    left: "88%",
    top: "61%",
    size: 2,
    delay: 1.1,
  },
  {
    left: "18%",
    top: "49%",
    size: 1,
    delay: 3,
  },
  {
    left: "31%",
    top: "57%",
    size: 1,
    delay: 1.5,
  },
  {
    left: "48%",
    top: "42%",
    size: 1,
    delay: 0.6,
  },
  {
    left: "63%",
    top: "54%",
    size: 1,
    delay: 2,
  },
  {
    left: "81%",
    top: "45%",
    size: 1,
    delay: 1,
  },
];

export default function NightSky() {
  const reduceMotion =
    useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
    >
      {/* Deep graphite night sky */}

      <div className="absolute inset-0 bg-gradient-to-br from-[#02040A] via-[#07101D] to-[#03060C]" />

      {/* Fine instrument grid */}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.018)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      {/* Restrained nebula fields */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  1,
                  1.08,
                  1,
                ],
                opacity: [
                  0.11,
                  0.2,
                  0.11,
                ],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-40 left-[18%] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[150px]"
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  1.08,
                  1,
                  1.08,
                ],
                opacity: [
                  0.08,
                  0.16,
                  0.08,
                ],
              }
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-48 right-[-7%] h-[470px] w-[470px] rounded-full bg-cyan-400/15 blur-[170px]"
      />

      <div className="absolute left-[62%] top-[26%] h-64 w-64 rounded-full bg-indigo-500/[0.07] blur-[115px]" />

      {/* Deterministic star field */}

      {stars.map(
        (
          star,
          index
        ) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              left:
                star.left,
              top:
                star.top,
              width:
                star.size,
              height:
                star.size,
              boxShadow:
                star.size >= 2
                  ? "0 0 9px rgba(191,219,254,0.85)"
                  : "0 0 5px rgba(255,255,255,0.55)",
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [
                      0.28,
                      star.size >=
                      2
                        ? 0.95
                        : 0.66,
                      0.28,
                    ],
                    scale: [
                      1,
                      star.size >=
                      2
                        ? 1.25
                        : 1.08,
                      1,
                    ],
                  }
            }
            transition={{
              duration:
                4 +
                (index %
                  4),
              delay:
                star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      )}

      {/* Faint compass geometry */}

      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full border border-blue-200/[0.035]" />

      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-blue-200/[0.025]" />

      <div className="absolute -left-10 -top-10 h-44 w-44 rotate-45 border border-blue-200/[0.02]" />

      {/* Soft top illumination */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.10),transparent_52%)]" />

      {/* Edge vignette */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.58)_100%)]" />
    </div>
  );
}