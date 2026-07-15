"use client";

import { motion } from "framer-motion";

export default function NorthStar() {
  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
    >
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.25, 0.65, 0.25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-40 w-40 rounded-full bg-blue-300 blur-3xl"
      />

      {/* Inner Glow */}
      <motion.div
        animate={{ scale: [1, 1.25, 1] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
        }}
        className="absolute h-20 w-20 rounded-full bg-white blur-xl"
      />

      {/* Star */}
      <motion.div
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="relative z-10"
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l2.7 6.2L21 9l-4.5 4.2L17.8 20 12 16.9 6.2 20l1.3-6.8L3 9l6.3-.8L12 2z" />
        </svg>
      </motion.div>
    </motion.div>
  );
}