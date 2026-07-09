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
        opacity: [0.8, 1, 0.8],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute left-1/2 top-10 -translate-x-1/2"
    >
      <div className="relative">

        {/* Glow */}

        <div className="absolute inset-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/20 blur-xl" />

        {/* Star */}

        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="#FDBA74"
        >
          <path d="M12 2l2.7 6.2L21 9l-4.5 4.2L17.8 20 12 16.9 6.2 20l1.3-6.8L3 9l6.3-.8L12 2z" />
        </svg>

      </div>
    </motion.div>
  );
}