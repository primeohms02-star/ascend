"use client";

import { motion } from "framer-motion";

type TimelineNodeProps = {
  title: string;
  completed?: boolean;
  current?: boolean;
};

export default function TimelineNode({
  title,
  completed = false,
  current = false,
}: TimelineNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
        ${
          completed
            ? "border-orange-500 bg-orange-500 text-white"
            : current
            ? "border-orange-500 bg-white text-orange-500"
            : "border-slate-300 bg-white text-slate-400"
        }`}
      >
        {completed ? "✓" : "•"}
      </div>

      <div>
        <h3
          className={`font-semibold ${
            current ? "text-orange-600" : "text-slate-900"
          }`}
        >
          {title}
        </h3>

        {current && (
          <p className="text-sm text-slate-500">
            You are here
          </p>
        )}
      </div>
    </motion.div>
  );
}