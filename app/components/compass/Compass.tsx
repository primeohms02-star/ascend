"use client";

import { motion } from "framer-motion";

import CompassSVG from "./CompassSVG";
import CompassNeedle from "./CompassNeedle";
import CompassGlass from "./CompassGlass";
import CompassGlow from "./CompassGlow";

type CompassProps = {
  size?: number;
};

export default function Compass({
  size = 520,
}: CompassProps) {
  return (
    <motion.div
      animate={{
        y: [-8, 8, -8],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <CompassGlow />

      <div className="relative h-full w-full">

        <CompassSVG />

        <CompassGlass />

        <CompassNeedle />

      </div>
    </motion.div>
  );
}