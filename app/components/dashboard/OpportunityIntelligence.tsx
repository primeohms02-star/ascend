"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Ranking = {
  northStar: number;
  skills: number;
  remote: number;
  saved: number;
  applied: number;
  passive: number;
  total: number;
};

type Props = {
  insight: {
    ranking: Ranking;
  };
};

export default function OpportunityIntelligence({
  insight,
}: Props) {

  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-2
          text-xs
          font-medium
          text-cyan-400
          transition
          hover:text-cyan-300
        "
      >
        <span>🧭 Atlas Intelligence</span>

        <span>
          {open ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              overflow-hidden
              mt-3
              rounded-xl
              border
              border-slate-700/50
              bg-slate-800/40
              p-4
            "
          >

            <div className="space-y-3 text-xs">

              <div className="flex justify-between text-slate-300">
                <span>🎯 North Star</span>
                <span>+{insight.ranking?.northStar ?? 0}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>🛠 Skills</span>
                <span>+{insight.ranking?.skills ?? 0}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>🌍 Remote Preference</span>
                <span>+{insight.ranking?.remote ?? 0}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>❤️ Saved Learning</span>
                <span>+{insight.ranking?.saved ?? 0}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>🚀 Apply Learning</span>
                <span>+{insight.ranking?.applied ?? 0}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>👀 Passive Learning</span>
                <span>{insight.ranking?.passive ?? 0}</span>
              </div>

              <div className="border-t border-slate-700 pt-3 mt-2 flex items-center justify-between">

                <span className="font-semibold text-cyan-300">
                  Atlas Rank
                </span>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  {insight.ranking?.total ?? 0}/100
                </span>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );

}