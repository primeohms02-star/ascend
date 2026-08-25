"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { summarizeMissionDetail } from "@/lib/atlas/missionContent";
import type { OnboardingAnswers, OnboardingOutcome } from "./types";

type Props = {
  answers: OnboardingAnswers;
  outcome: OnboardingOutcome | null;
};

export default function StepComplete({ answers, outcome }: Props) {
  const missionPreview = summarizeMissionDetail(
    outcome?.mission.reason,
    145,
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl text-center"
    >
      <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-200">
        <Compass size={38} strokeWidth={1.6} aria-hidden="true" />
      </div>

      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
        You&apos;re Ready
      </p>

      <h1 className="text-5xl font-black text-white md:text-6xl">
        Welcome to
        <br />
        ASCEND
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
        Atlas has converted your answers into a direction and first meaningful action.
      </p>

      <div className="mx-auto mt-9 grid max-w-3xl gap-4 text-left md:grid-cols-2">
        <article className="rounded-2xl border border-blue-400/20 bg-blue-400/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Your North Star
          </p>
          <p className="mt-3 text-base leading-7 text-slate-200">
            {answers.northStar}
          </p>
        </article>

        <article className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Your First Mission
          </p>
          <h2 className="mt-3 text-lg font-semibold text-white">
            {outcome?.mission.mission ?? "Your first mission is ready"}
          </h2>
          {outcome?.mission.reason ? (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {missionPreview}
            </p>
          ) : null}
        </article>
      </div>

      <Link
        href="/dashboard"
        className="mt-14 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
      >
        Enter ASCEND
        <ArrowRight size={19} aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
