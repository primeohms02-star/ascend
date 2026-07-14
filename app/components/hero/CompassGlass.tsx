"use client";

import { motion } from "framer-motion";

export default function CompassGlass() {
  return (
    <>
      {/* Main Glass Surface */}

      <div className="absolute inset-2 rounded-full bg-white/[0.03] backdrop-blur-sm" />

      {/* Soft Glass Highlight */}

      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-3 rounded-full overflow-hidden"
      >
        <div
          className="
            absolute
            -left-32
            -top-40
            h-[260px]
            w-[120px]
            rotate-[35deg]
            bg-gradient-to-b
            from-white/35
            via-white/10
            to-transparent
            blur-2xl
          "
        />
      </motion.div>

      {/* Secondary Reflection */}

      <motion.div
        animate={{
          x: [-10, 10, -10],
          y: [-6, 6, -6],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-6 rounded-full overflow-hidden"
      >
        <div
          className="
            absolute
            right-8
            top-6
            h-24
            w-24
            rounded-full
            bg-white/10
            blur-2xl
          "
        />
      </motion.div>

      {/* Rim Light */}

      <div
        className="
          absolute
          inset-0
          rounded-full
          border
          border-white/10
          shadow-[inset_0_0_60px_rgba(255,255,255,0.05)]
        "
      />

      {/* Blue Ambient Glow */}

      <motion.div
        animate={{
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          inset-10
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
      />

      {/* Top Specular Highlight */}

      <div
        className="
          absolute
          left-1/2
          top-4
          h-6
          w-44
          -translate-x-1/2
          rounded-full
          bg-white/20
          blur-xl
        "
      />
    </>
  );
}