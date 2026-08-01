"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

type CompassNeedleProps = {
  state?:
    | "lost"
    | "exploring"
    | "growing"
    | "ascending";
};

export default function CompassNeedle({
  state = "exploring",
}: CompassNeedleProps) {
  const reduceMotion =
    useReducedMotion();

  const idleRotation =
    state === "lost"
      ? [
          0,
          -7,
          6,
          -4,
          3,
          0,
        ]
      : state === "growing"
      ? [
          0,
          -1.8,
          1.2,
          -0.7,
          0,
        ]
      : state === "ascending"
      ? [
          0,
          -0.6,
          0.7,
          -0.3,
          0,
        ]
      : [
          0,
          -3,
          2.2,
          -1.2,
          0.7,
          0,
        ];

  return (
    <motion.svg
      viewBox="0 0 500 500"
      className="pointer-events-none absolute inset-0 h-full w-full"
      initial={
        reduceMotion
          ? false
          : {
              rotate: 38,
            }
      }
      animate={{
        rotate: 0,
      }}
      transition={{
        duration: 2.4,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Blue north needle */}

        <linearGradient
          id="north-needle"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor="#1E3A8A"
          />

          <stop
            offset="28%"
            stopColor="#2563EB"
          />

          <stop
            offset="52%"
            stopColor="#BFDBFE"
          />

          <stop
            offset="70%"
            stopColor="#3B82F6"
          />

          <stop
            offset="100%"
            stopColor="#172554"
          />
        </linearGradient>

        {/* Silver south needle */}

        <linearGradient
          id="south-needle"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor="#334155"
          />

          <stop
            offset="26%"
            stopColor="#94A3B8"
          />

          <stop
            offset="52%"
            stopColor="#F8FAFC"
          />

          <stop
            offset="74%"
            stopColor="#64748B"
          />

          <stop
            offset="100%"
            stopColor="#1E293B"
          />
        </linearGradient>

        {/* Needle shadow */}

        <filter
          id="needle-shadow"
          x="-100%"
          y="-30%"
          width="300%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="5"
            floodColor="#000000"
            floodOpacity="0.85"
          />
        </filter>

        {/* Blue illumination */}

        <filter
          id="needle-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            stdDeviation="6"
            result="blur"
          />

          <feMerge>
            <feMergeNode
              in="blur"
            />

            <feMergeNode
              in="SourceGraphic"
            />
          </feMerge>
        </filter>
      </defs>

      {/* Calm movement after initial calibration */}

      <motion.g
        animate={
          reduceMotion
            ? undefined
            : {
                rotate:
                  idleRotation,
              }
        }
        transition={{
          delay: 2.5,
          duration:
            state === "lost"
              ? 9
              : 12,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
        }}
        style={{
          transformOrigin:
            "250px 250px",
        }}
      >
        {/* Soft northward light beam */}

        <motion.path
          d="M250 72 L267 245 L250 232 L233 245 Z"
          fill="#3B82F6"
          opacity="0.13"
          filter="url(#needle-glow)"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [
                    0.08,
                    0.2,
                    0.08,
                  ],
                }
          }
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Needle shadow beneath instrument */}

        <path
          d="M250 79 L265 250 L250 269 L235 250 Z"
          fill="#000000"
          opacity="0.7"
          filter="url(#needle-shadow)"
          transform="translate(0 5)"
        />

        {/* South silver needle */}

        <path
          d="M250 426 L263 250 L250 267 L237 250 Z"
          fill="url(#south-needle)"
          stroke="#E2E8F0"
          strokeOpacity="0.28"
          strokeWidth="1"
        />

        {/* South dimensional edge */}

        <path
          d="M250 426 L250 267 L237 250 Z"
          fill="#0F172A"
          opacity="0.48"
        />

        <path
          d="M250 426 L255 267 L250 267 Z"
          fill="#FFFFFF"
          opacity="0.18"
        />

        {/* North blue needle */}

        <path
          d="M250 72 L264 250 L250 235 L236 250 Z"
          fill="url(#north-needle)"
          stroke="#93C5FD"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />

        {/* North dimensional shadow */}

        <path
          d="M250 72 L250 235 L236 250 Z"
          fill="#172554"
          opacity="0.58"
        />

        {/* North metallic highlight */}

        <path
          d="M250 72 L255 238 L250 235 Z"
          fill="#EFF6FF"
          opacity="0.62"
        />

        {/* Cyan leading edge */}

        <path
          d="M250 72 L264 250"
          fill="none"
          stroke="#67E8F9"
          strokeWidth="1.4"
          strokeOpacity="0.75"
          filter="url(#needle-glow)"
        />

        {/* Mechanical pivot shadow */}

        <circle
          cx="250"
          cy="250"
          r="27"
          fill="#000000"
          opacity="0.58"
          transform="translate(0 4)"
        />

        {/* Outer pivot ring */}

        <circle
          cx="250"
          cy="250"
          r="25"
          fill="#030712"
          stroke="#CBD5E1"
          strokeOpacity="0.72"
          strokeWidth="2"
        />

        {/* Graphite pivot */}

        <circle
          cx="250"
          cy="250"
          r="19"
          fill="#111827"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Sapphire mechanism */}

        <circle
          cx="250"
          cy="250"
          r="13"
          fill="#1D4ED8"
          stroke="#93C5FD"
          strokeOpacity="0.8"
          strokeWidth="1.4"
          filter="url(#needle-glow)"
        />

        <motion.circle
          cx="250"
          cy="250"
          r="8"
          fill="#60A5FA"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [
                    0.78,
                    1,
                    0.78,
                  ],
                  scale: [
                    1,
                    1.08,
                    1,
                  ],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin:
              "250px 250px",
          }}
        />

        {/* Glass jewel highlight */}

        <circle
          cx="247"
          cy="246"
          r="2.5"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </motion.g>
    </motion.svg>
  );
}