"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

type Props = {
  onNext: () => void;
};

export default function StepBuilding({ onNext }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onNext]);

  const messages = [
    "Understanding your goals...",
    "Mapping opportunities...",
    "Building your roadmap...",
    "Preparing your dashboard...",
  ];

  return (
    <div className="mx-auto max-w-3xl text-center">

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="mx-auto mb-10 h-36 w-36"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/5">
          <span className="text-5xl">🧭</span>
        </div>
      </motion.div>

      <h2 className="text-4xl font-bold text-white">
        Building Your Compass
      </h2>

      <p className="mt-5 text-lg text-slate-400">
        Personalizing ASCEND for you...
      </p>

      <div className="mt-12 space-y-5">

        {messages.map((message, index) => (
          <motion.p
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              delay: index,
              duration: 1.5,
              repeat: Infinity,
            }}
            className="text-slate-300"
          >
            {message}
          </motion.p>
        ))}

      </div>

      <div className="mt-12 h-2 overflow-hidden rounded-full bg-white/10">

        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 5,
            ease: "linear",
          }}
          className="h-full rounded-full bg-blue-500"
        />

      </div>

    </div>
  );
}