"use client";

import { motion } from "framer-motion";

type MissionCardProps = {
  title: string;
  description: string;
};

export default function MissionCard({
  title,
  description,
}: MissionCardProps) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
      }}
      className="rounded-3xl border border-orange-200 bg-white p-8 shadow-lg"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Mission Control
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Today's Mission
          </h2>

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-white shadow-md">
          🎯
        </div>

      </div>

      {/* Mission */}

      <div className="mt-8">

        <h3 className="text-2xl font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-slate-600">
          {description}
        </p>

      </div>

      {/* Mission Stats */}

      <div className="mt-8 grid grid-cols-3 gap-4">

        <div className="rounded-2xl bg-slate-100 p-4 text-center">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Time
          </p>

          <p className="mt-2 font-semibold text-slate-900">
            45 min
          </p>

        </div>

        <div className="rounded-2xl bg-slate-100 p-4 text-center">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Difficulty
          </p>

          <p className="mt-2 font-semibold text-orange-600">
            Medium
          </p>

        </div>

        <div className="rounded-2xl bg-slate-100 p-4 text-center">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Reward
          </p>

          <p className="mt-2 font-semibold text-slate-900">
            +120 XP
          </p>

        </div>

      </div>

      {/* Start Mission */}

      <button
        className="mt-8 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-semibold text-white transition hover:bg-orange-600"
      >
        Start Mission
      </button>

      {/* Philosophy */}

      <div className="mt-8 rounded-2xl bg-orange-50 p-5">

        <p className="text-center text-sm italic leading-7 text-slate-600">
          "One mission.
          <br />
          One focus.
          <br />
          One step closer to your North Star."
        </p>

      </div>

    </motion.section>
  );
}