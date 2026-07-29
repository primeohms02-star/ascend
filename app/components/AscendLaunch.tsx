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

export default function AscendLaunch() {
  const shouldReduceMotion =
    useReducedMotion();

  const [visible, setVisible] =
    useState(true);

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
      setVisible(false);
      return;
    }

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

          setVisible(false);

          document.body.style.overflow =
            previousOverflow;
        },
        shouldReduceMotion
          ? 600
          : 2000
      );

    return () => {
      window.clearTimeout(timer);

      document.body.style.overflow =
        previousOverflow;
    };
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
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
                shouldReduceMotion
                  ? 0.3
                  : 1.8,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="absolute h-72 w-72 rounded-full bg-cyan-500/25 blur-[110px] sm:h-96 sm:w-96"
          />

          {/* Logo */}

          <motion.div
            initial={{
              opacity: 0,
              scale:
                shouldReduceMotion
                  ? 0.95
                  : 0.38,
              filter: "blur(7px)",
            }}
            animate={{
              opacity: 1,
              scale: 1.08,
              filter: "blur(0px)",
            }}
            transition={{
              duration:
                shouldReduceMotion
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
                shouldReduceMotion
                  ? 0.3
                  : 0.7,
              delay:
                shouldReduceMotion
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