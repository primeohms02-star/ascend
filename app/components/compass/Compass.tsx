"use client";

import type {
  PointerEvent,
} from "react";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import CompassGlass from "./CompassGlass";
import CompassGlow from "./CompassGlow";
import CompassNeedle from "./CompassNeedle";
import CompassSVG from "./CompassSVG";

type CompassProps = {
  size?: number;

  state?:
    | "lost"
    | "exploring"
    | "growing"
    | "ascending";
};

export default function Compass({
  size = 460,
  state = "exploring",
}: CompassProps) {
  const reduceMotion =
    useReducedMotion();

  const pointerX =
    useMotionValue(0);

  const pointerY =
    useMotionValue(0);

  const rotateX = useSpring(
    useTransform(
      pointerY,
      [-0.5, 0.5],
      [5, -5]
    ),
    {
      stiffness: 130,
      damping: 22,
      mass: 0.8,
    }
  );

  const rotateY = useSpring(
    useTransform(
      pointerX,
      [-0.5, 0.5],
      [-5, 5]
    ),
    {
      stiffness: 130,
      damping: 22,
      mass: 0.8,
    }
  );

  const highlightX =
    useTransform(
      pointerX,
      [-0.5, 0.5],
      ["28%", "72%"]
    );

  const highlightY =
    useTransform(
      pointerY,
      [-0.5, 0.5],
      ["28%", "72%"]
    );

  function handlePointerMove(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (reduceMotion) {
      return;
    }

    const bounds =
      event.currentTarget
        .getBoundingClientRect();

    pointerX.set(
      (event.clientX -
        bounds.left) /
        bounds.width -
        0.5
    );

    pointerY.set(
      (event.clientY -
        bounds.top) /
        bounds.height -
        0.5
    );
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      className="relative flex w-full items-center justify-center"
      onPointerMove={
        handlePointerMove
      }
      onPointerLeave={
        resetPointer
      }
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.82,
          rotate: -8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: 1.25,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="relative aspect-square w-full"
        style={{
          width: size,
          maxWidth: "88vw",
          rotateX:
            reduceMotion
              ? 0
              : rotateX,
          rotateY:
            reduceMotion
              ? 0
              : rotateY,
          transformPerspective:
            1100,
          transformStyle:
            "preserve-3d",
        }}
      >
        {/* Ambient illumination */}

        <CompassGlow />

        {/* Grounded instrument shadow */}

        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-[-5%] h-[18%] rounded-full bg-black/80 blur-3xl"
        />

        {/* Slowly moving exterior calibration ring */}

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[-3%] rounded-full border border-dashed border-cyan-300/10"
        />

        {/* Counter-rotating precision ring */}

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={{
            duration: 140,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[2%] rounded-full border border-blue-300/10"
        >
          <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />

          <span className="absolute bottom-[-3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-400/70" />

          <span className="absolute left-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-400/60" />

          <span className="absolute right-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-400/60" />
        </motion.div>

        {/* Metallic housing */}

        <div
          className="absolute inset-[5%] overflow-hidden rounded-full border border-slate-300/25 bg-gradient-to-br from-slate-300/20 via-slate-950 to-slate-500/20 p-[2px] shadow-[0_30px_80px_rgba(0,0,0,0.75),0_0_55px_rgba(37,99,235,0.22),inset_0_1px_1px_rgba(255,255,255,0.3)]"
          style={{
            transform:
              "translateZ(18px)",
          }}
        >
          {/* Brushed graphite rim */}

          <div className="relative h-full w-full rounded-full bg-[conic-gradient(from_210deg,#0f172a,#64748b_8%,#111827_18%,#cbd5e1_27%,#1e293b_38%,#94a3b8_50%,#0f172a_64%,#475569_76%,#cbd5e1_87%,#111827)] p-[3.2%]">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-[#05070B] shadow-[inset_0_0_55px_rgba(0,0,0,0.95),inset_0_0_10px_rgba(148,163,184,0.25)]">
              {/* Real instrument face */}

              <CompassSVG />

              {/* Calibrating needle */}

              <CompassNeedle
                state={state}
              />

              {/* Responsive glass reflection */}

              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full opacity-50"
                style={{
                  background:
                    "radial-gradient(circle at var(--highlight-x) var(--highlight-y), rgba(255,255,255,0.20), rgba(125,211,252,0.07) 18%, transparent 42%)",
                  ["--highlight-x" as string]:
                    highlightX,
                  ["--highlight-y" as string]:
                    highlightY,
                }}
              />

              <CompassGlass />
            </div>
          </div>
        </div>

        {/* External north marker */}

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [
                    0.55,
                    1,
                    0.55,
                  ],
                  scale: [
                    1,
                    1.08,
                    1,
                  ],
                }
          }
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[1.5%] -translate-x-1/2"
        >
          <div className="h-0 w-0 border-x-[7px] border-b-[14px] border-x-transparent border-b-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
        </motion.div>
      </motion.div>
    </div>
  );
}