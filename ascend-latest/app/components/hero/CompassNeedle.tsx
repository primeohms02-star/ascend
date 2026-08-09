"use client";

import {
  motion,
  animate,
  useMotionValue,
} from "framer-motion";
import { useEffect } from "react";

type CompassNeedleProps = {
  state?: "lost" | "exploring" | "growing" | "ascending";
};

export default function CompassNeedle({
  state = "exploring",
}: CompassNeedleProps) {
  const rotation = useMotionValue(0);

  useEffect(() => {
    let mounted = true;

    const config = {
      lost: {
        range: 24,
        pause: 900,
      },

      exploring: {
        range: 12,
        pause: 1600,
      },

      growing: {
        range: 5,
        pause: 2400,
      },

      ascending: {
        range: 1.5,
        pause: 3500,
      },
    };

    async function magneticMotion() {
      while (mounted) {
        const current = config[state];

        const target =
          (Math.random() - 0.5) *
          current.range;

        await animate(rotation, target, {
          duration: 2,
          ease: "easeInOut",
        });

        await animate(
          rotation,
          target * 1.18,
          {
            duration: 0.35,
            ease: "easeOut",
          }
        );

        await animate(rotation, target, {
          duration: 0.45,
          ease: "easeInOut",
        });

        await new Promise((r) =>
          setTimeout(r, current.pause)
        );
      }
    }

    magneticMotion();

    return () => {
      mounted = false;
    };
  }, [rotation, state]);

  return (
    <motion.div
      style={{
        rotate: rotation,
      }}
      className="absolute flex h-[260px] w-5 origin-center flex-col items-center"
    >
      {/* North Needle */}

      <div className="relative h-[130px] w-full">

        <div
          className="
            absolute
            left-1/2
            top-0
            h-[118px]
            w-[8px]
            -translate-x-1/2
            rounded-full
            bg-gradient-to-t
            from-sky-400
            via-blue-500
            to-cyan-300
            shadow-[0_0_30px_rgba(59,130,246,.8)]
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-[-10px]
            h-0
            w-0
            -translate-x-1/2
            border-l-[10px]
            border-r-[10px]
            border-b-[22px]
            border-l-transparent
            border-r-transparent
            border-b-cyan-300
          "
        />

      </div>

      {/* South Needle */}

      <div className="relative h-[130px] w-full">

        <div
          className="
            absolute
            left-1/2
            bottom-0
            h-[118px]
            w-[8px]
            -translate-x-1/2
            rounded-full
            bg-gradient-to-b
            from-white
            via-gray-300
            to-gray-500
          "
        />

        <div
          className="
            absolute
            bottom-[-10px]
            left-1/2
            h-0
            w-0
            -translate-x-1/2
            border-l-[10px]
            border-r-[10px]
            border-t-[22px]
            border-l-transparent
            border-r-transparent
            border-t-gray-300
          "
        />

      </div>

      {/* Bearing */}

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          flex
          h-12
          w-12
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/40
          backdrop-blur-xl
        "
      >
        <div
          className="
            h-5
            w-5
            rounded-full
            bg-blue-500
            shadow-[0_0_25px_rgba(59,130,246,.9)]
          "
        />
      </motion.div>
    </motion.div>
  );
}