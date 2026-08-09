"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

const SPLASH_STORAGE_KEY =
  "ascend-launch-seen";

type LaunchStatus =
  | "checking"
  | "visible"
  | "hidden";

export default function AscendLaunch() {
  const shouldReduceMotion =
    useReducedMotion();

  const [status, setStatus] =
    useState<LaunchStatus>("checking");

  const [isCompactDevice, setIsCompactDevice] =
    useState(false);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    let hasSeenLaunch = false;

    try {
      hasSeenLaunch =
        window.sessionStorage.getItem(
          SPLASH_STORAGE_KEY
        ) === "true";
    } catch {
      hasSeenLaunch = false;
    }

    if (hasSeenLaunch) {
      setStatus("hidden");
      return;
    }

    const compactDevice =
      window.matchMedia(
        "(max-width: 767px), (prefers-reduced-motion: reduce)"
      ).matches;

    setIsCompactDevice(compactDevice);

    setStatus("visible");

    document.body.style.overflow =
      "hidden";

    const timer =
      window.setTimeout(
        () => {
          try {
            window.sessionStorage.setItem(
              SPLASH_STORAGE_KEY,
              "true"
            );
          } catch {
            // Continue if browser storage is unavailable.
          }

          setStatus("hidden");

          document.body.style.overflow =
            previousOverflow;
        },
        shouldReduceMotion
          ? 300
          : compactDevice
            ? 800
            : 1600
      );

    return () => {
      window.clearTimeout(timer);

      document.body.style.overflow =
        previousOverflow;
    };
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {status === "visible" && (
        <motion.div
          initial={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration:
              shouldReduceMotion
                ? 0.2
                : 0.4,
            ease: "easeInOut",
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#020407]"
          role="status"
          aria-label="ASCEND is opening"
        >
          {/* Ambient glow */}

          <motion.div
            aria-hidden="true"
            initial={{
              opacity: 0,
              scale: 0.65,
            }}
            animate={{
              opacity: 0.4,
              scale: 1.25,
            }}
            transition={{
              duration:
                shouldReduceMotion ||
                isCompactDevice
                  ? 0.3
                  : 1.8,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="absolute hidden h-96 w-96 rounded-full bg-cyan-500/25 blur-[110px] md:block"
          />

          {/* Logo */}

          <motion.div
            initial={{
              opacity: 0,
              scale:
                shouldReduceMotion
                  ? 0.95
                  : isCompactDevice
                    ? 0.9
                    : 0.38,
              filter:
                isCompactDevice
                  ? "blur(0px)"
                  : "blur(7px)",
            }}
            animate={{
              opacity: 1,
              scale: 1.08,
              filter: "blur(0px)",
            }}
            transition={{
              duration:
                shouldReduceMotion ||
                isCompactDevice
                  ? 0.3
                  : 1.85,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="relative h-40 w-40 will-change-transform sm:h-52 sm:w-52 md:h-60 md:w-60"
          >
            <Image
              src="/ascend-navbar-logo.png"
              alt="ASCEND"
              fill
              priority
              sizes="(max-width: 640px) 160px, (max-width: 768px) 208px, 240px"
              className="object-contain"
            />
          </motion.div>

          {/* Brand identity */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                shouldReduceMotion ||
                isCompactDevice
                  ? 0.3
                  : 0.7,
              delay:
                shouldReduceMotion ||
                isCompactDevice
                  ? 0
                  : 0.2,
              ease: "easeOut",
            }}
            className="absolute bottom-12 text-center sm:bottom-16"
          >
            <p className="text-sm font-black tracking-[0.32em] text-white sm:text-base">
              ASCEND
            </p>

            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
              Your direction is loading
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
