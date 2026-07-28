"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import type {
  OnboardingAnswers,
} from "./types";

type Props = {
  answers: OnboardingAnswers;

  onComplete: () => void;
};

const messages = [
  "Understanding your current stage...",
  "Analyzing your goals and challenges...",
  "Connecting your vision to relevant opportunities...",
  "Designing your first strategic mission...",
  "Preparing your ASCEND dashboard...",
];

export default function StepBuilding({
  answers,
  onComplete,
}: Props) {
  const [
    activeMessage,
    setActiveMessage,
  ] = useState(0);

  const [error, setError] =
    useState("");

  const [retryKey, setRetryKey] =
    useState(0);

  const submitted =
    useRef(false);

  const submitOnboarding =
    useCallback(async () => {
      setError("");

      try {
        const response =
          await fetch(
            "/api/onboarding",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                answers
              ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Atlas could not complete your onboarding."
          );
        }

        onComplete();
      } catch (error) {
        submitted.current =
          false;

        setError(
          error instanceof Error
            ? error.message
            : "Atlas could not complete your onboarding."
        );
      }
    }, [
      answers,
      onComplete,
    ]);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setActiveMessage(
          (current) =>
            Math.min(
              current + 1,
              messages.length - 1
            )
        );
      }, 1400);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  useEffect(() => {
    if (submitted.current) {
      return;
    }

    submitted.current = true;

    submitOnboarding();
  }, [
    retryKey,
    submitOnboarding,
  ]);

  function retry() {
    submitted.current = false;

    setActiveMessage(0);

    setRetryKey(
      (current) =>
        current + 1
    );
  }

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
          <span className="text-5xl">
            🧭
          </span>
        </div>
      </motion.div>

      <h2 className="text-4xl font-bold text-white">
        Building Your Compass
      </h2>

      <p className="mt-5 text-lg text-slate-400">
        Atlas is turning your
        answers into a direction
        and first mission.
      </p>

      {!error && (
        <>
          <div className="mt-12 min-h-20">
            {messages.map(
              (
                message,
                index
              ) => (
                <motion.p
                  key={message}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity:
                      index ===
                      activeMessage
                        ? 1
                        : 0,
                    y:
                      index ===
                      activeMessage
                        ? 0
                        : 8,
                  }}
                  className={`text-lg text-slate-300 ${
                    index ===
                    activeMessage
                      ? "block"
                      : "hidden"
                  }`}
                >
                  {message}
                </motion.p>
              )
            )}
          </div>

          <div className="mt-10 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{
                width: "5%",
              }}
              animate={{
                width: "92%",
              }}
              transition={{
                duration: 8,
                ease: "easeOut",
              }}
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
            />
          </div>
        </>
      )}

      {error && (
        <div className="mt-10 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6">
          <h3 className="text-lg font-semibold text-white">
            Atlas could not finish
            your Compass
          </h3>

          <p className="mt-3 text-sm leading-6 text-rose-200">
            {error}
          </p>

          <button
            type="button"
            onClick={retry}
            className="mt-6 rounded-2xl bg-rose-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-rose-300"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}