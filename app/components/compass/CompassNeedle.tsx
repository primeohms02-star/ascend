"use client";

import { motion } from "framer-motion";

type Props = {
  state?: "lost" | "exploring" | "growing" | "ascending";
};

export default function CompassNeedle({
  state = "exploring",
}: Props) {
  const rotation =
    state === "lost"
      ? [-18, 12, -14, 15, -6]
      : state === "growing"
      ? [-2, 1.5, -1, 0.8, 0]
      : state === "ascending"
      ? [0, 0.8, -0.8, 0]
      : [-5, 4, -3, 2, 0];

  return (
    <motion.svg
      viewBox="0 0 500 500"
      className="absolute inset-0 h-full w-full"
      animate={{
        rotate: rotation,
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Blue Glow */}

      <polygon
        points="250,88 260,250 250,236 240,250"
        fill="#3B82F6"
        opacity="0.18"
      />

      {/* North Needle */}

      <polygon
        points="250,95 257,250 250,240 243,250"
        fill="#3B82F6"
      />

      {/* North Highlight */}

      <polygon
        points="250,95 253.5,250 250,240"
        fill="#93C5FD"
        opacity="0.7"
      />

      {/* South Needle */}

      <polygon
        points="250,405 257,250 250,260 243,250"
        fill="#D1D5DB"
      />

      {/* South Highlight */}

      <polygon
        points="250,405 253.5,250 250,260"
        fill="#F8FAFC"
        opacity="0.5"
      />

      {/* Premium Hub */}

<circle
  cx="250"
  cy="250"
  r="20"
  fill="#05070B"
  stroke="#94A3B8"
  strokeWidth="1.8"
/>

<circle
  cx="250"
  cy="250"
  r="15"
  fill="#111827"
/>

<circle
  cx="250"
  cy="250"
  r="11"
  fill="#1E3A8A"
/>

<motion.circle
  cx="250"
  cy="250"
  r="8"
  fill="#60A5FA"
  animate={{
    scale: [1, 1.12, 1],
    opacity: [0.85, 1, 0.85],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>

<circle
  cx="247"
  cy="246"
  r="2"
  fill="#FFFFFF"
  opacity="0.75"
/>

<circle
  cx="250"
  cy="250"
  r="4"
  fill="#DBEAFE"
  opacity="0.9"
/>
    </motion.svg>
  );
}