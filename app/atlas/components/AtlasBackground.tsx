"use client";

import { motion } from "framer-motion";

export default function AtlasBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* Deep Space */}

      <div className="absolute inset-0 bg-gradient-to-b from-[#01040B] via-[#07111D] to-[#020611]" />

      {/* Nebula */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.45, 0.7, 0.45],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-40 top-10 h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[240px]"
      />

      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-52 bottom-0 h-[900px] w-[900px] rounded-full bg-cyan-500/10 blur-[260px]"
      />

      {/* Floating Stars */}

      {Array.from({ length: 120 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: Math.random(),
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 2 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          className="absolute rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }}
        />
      ))}

    </div>
  );
}