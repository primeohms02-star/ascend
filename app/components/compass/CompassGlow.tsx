"use client";

import { motion } from "framer-motion";

export default function CompassGlow() {
  return (
    <>
      {/* Primary Blue Glow */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.18, 0.35, 0.18],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          inset-[-40px]
          rounded-full
          bg-blue-500
          blur-[100px]
        "
      />

      {/* Secondary Cyan Glow */}

      <motion.div
        animate={{
          scale: [1.05, 1.12, 1.05],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          inset-[-20px]
          rounded-full
          bg-cyan-400
          blur-[70px]
        "
      />

      {/* Inner Halo */}

      <motion.div
        animate={{
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          inset-[55px]
          rounded-full
          border
          border-blue-400/20
          shadow-[0_0_40px_rgba(59,130,246,.35)]
        "
      />
    </>
  );
}