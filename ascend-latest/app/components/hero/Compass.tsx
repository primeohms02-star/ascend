"use client";

import { motion } from "framer-motion";

import CompassDial from "./CompassDial";
import CompassGlass from "./CompassGlass";
import CompassNeedle from "./CompassNeedle";

type CompassProps = {
  state?: "lost" | "exploring" | "growing" | "ascending";
};

export default function Compass({
  state = "exploring",
}: CompassProps) {
  return (
    <div className="relative flex items-center justify-center">

      {/* Outer Ambient Glow */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.22, 0.5, 0.22],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-[560px] w-[560px] rounded-full bg-blue-500 blur-[130px]"
      />

      {/* Secondary Glow */}

      <motion.div
        animate={{
          scale: [1.05, 1.12, 1.05],
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-[470px] w-[470px] rounded-full bg-cyan-400 blur-[90px]"
      />

      {/* Floating Compass */}

      <motion.div
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >

        {/* Compass Body */}

        <div
          className="
            relative
            flex
            h-[430px]
            w-[430px]
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-white/10
            bg-[#0B111B]/90
            shadow-[0_0_80px_rgba(59,130,246,.25)]
            backdrop-blur-3xl
          "
        >

          {/* Glass */}

          <CompassGlass />

          {/* Dial */}

          <CompassDial />

          {/* Needle */}

          <CompassNeedle state={state} />

        </div>

      </motion.div>

    </div>
  );
}