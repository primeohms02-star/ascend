"use client";

import { motion } from "framer-motion";

export default function NorthStar() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: [0.85, 1, 0.85],
        scale: [1, 1.12, 1],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute left-1/2 top-8 -translate-x-1/2"
    >
      <div className="relative flex items-center justify-center">

        {/* Outer Glow */}

        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-36 w-36 rounded-full bg-blue-400 blur-[70px]"
        />

        {/* Inner Glow */}

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-20 w-20 rounded-full bg-cyan-300 blur-[35px]"
        />

        {/* Star Rays */}

        <div className="absolute h-20 w-[2px] rounded-full bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-70" />

        <div className="absolute h-[2px] w-20 rounded-full bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-70" />

        <div className="absolute h-16 w-[2px] rotate-45 rounded-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-50" />

        <div className="absolute h-16 w-[2px] -rotate-45 rounded-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-50" />

        {/* Main Star */}

        <motion.svg
          animate={{
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="#F8FAFF"
          className="relative drop-shadow-[0_0_18px_rgba(96,165,250,0.95)]"
        >
          <path d="M12 2l2.7 6.2L21 9l-4.5 4.2L17.8 20 12 16.9 6.2 20l1.3-6.8L3 9l6.3-.8L12 2z" />
        </motion.svg>

        {/* Orbiting Sparkles */}

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute h-24 w-24"
        >
          <div className="absolute left-0 top-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />

          <div className="absolute right-0 top-1/3 h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_8px_white]" />

          <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_10px_white]" />
        </motion.div>

      </div>
    </motion.div>
  );
}