"use client";

import { motion } from "framer-motion";

export default function CompassRose() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">

      <motion.svg
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 0.12,
          scale: [1, 1.015, 1],
          rotate: [0, 360],
        }}
        transition={{
          opacity: {
            duration: 2,
          },
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 120,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        className="h-[900px] w-[900px]"
        viewBox="0 0 1000 1000"
        fill="none"
      >

        {/* Outer Ring */}
        <circle
          cx="500"
          cy="500"
          r="430"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />

        {/* Inner Ring */}
        <circle
          cx="500"
          cy="500"
          r="320"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Vertical */}
        <line
          x1="500"
          y1="80"
          x2="500"
          y2="920"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="2"
        />

        {/* Horizontal */}
        <line
          x1="80"
          y1="500"
          x2="920"
          y2="500"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="2"
        />

        {/* Diagonal */}
        <line
          x1="180"
          y1="180"
          x2="820"
          y2="820"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        <line
          x1="820"
          y1="180"
          x2="180"
          y2="820"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* North */}
        <polygon
          points="500,120 520,500 500,455 480,500"
          fill="rgba(255,255,255,0.45)"
        />

        {/* South */}
        <polygon
          points="500,880 520,500 500,545 480,500"
          fill="rgba(255,255,255,0.08)"
        />

        {/* East */}
        <polygon
          points="880,500 500,520 545,500 500,480"
          fill="rgba(255,255,255,0.08)"
        />

        {/* West */}
        <polygon
          points="120,500 500,520 455,500 500,480"
          fill="rgba(255,255,255,0.08)"
        />

        {/* Center Dot */}
        <circle
          cx="500"
          cy="500"
          r="8"
          fill="rgba(255,255,255,0.55)"
        />

        {/* N */}
        <text
          x="500"
          y="55"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="28"
          fontWeight="300"
          letterSpacing="8"
        >
          N
        </text>

        {/* E */}
        <text
          x="945"
          y="510"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="28"
          fontWeight="300"
          letterSpacing="8"
        >
          E
        </text>

        {/* S */}
        <text
          x="500"
          y="965"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="28"
          fontWeight="300"
          letterSpacing="8"
        >
          S
        </text>

        {/* W */}
        <text
          x="55"
          y="510"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="28"
          fontWeight="300"
          letterSpacing="8"
        >
          W
        </text>

      </motion.svg>

    </div>
  );
}