"use client";

import { motion } from "framer-motion";

type Star = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;

  return value - Math.floor(value);
}

const stars: Star[] = Array.from({ length: 72 }, (_, index) => {
  const seed = index + 1;

  return {
    left: pseudoRandom(seed) * 100,
    top: pseudoRandom(seed + 100) * 100,
    size: 1 + pseudoRandom(seed + 200) * 2,
    opacity: pseudoRandom(seed + 300),
    duration: 2 + pseudoRandom(seed + 400) * 6,
    delay: pseudoRandom(seed + 500) * 5,
  };
});

export default function AtlasBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-[#01040B] via-[#07111D] to-[#020611]" />

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

      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: star.opacity }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
        />
      ))}

    </div>
  );
}
