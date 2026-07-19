"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Star = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

export default function AtlasBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 120 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2,
      opacity: Math.random(),
      duration: 2 + Math.random() * 6,
      delay: Math.random() * 5,
    }));

    setStars(generatedStars);
  }, []);

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