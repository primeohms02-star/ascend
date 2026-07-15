"use client";

import { motion } from "framer-motion";

export default function EnergyPulse() {
  return (
    <motion.div
      animate={{
        offsetDistance: ["0%", "100%"],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        offsetPath:
          'path("M500 130 C420 250 620 330 500 450 S380 650 500 760 S620 900 500 930")',
      }}
      className="absolute h-5 w-5 rounded-full bg-cyan-300 shadow-[0_0_35px_12px_rgba(34,211,238,.9)]"
    />
  );
}