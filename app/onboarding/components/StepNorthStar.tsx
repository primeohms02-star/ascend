"use client";

import { motion } from "framer-motion";

type Props = {
  value: string;

  onChange: (
    northStar: string
  ) => void;

  onNext: () => void;
};

export default function StepNorthStar({
  value,
  onChange,
  onNext,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 40,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="mx-auto max-w-3xl"
    >
      <div className="text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
          Your North Star
        </p>

        <h2 className="text-4xl font-bold text-white">
          Imagine your life
          <br />
          three years from now.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Describe the work you are doing, the impact
          you are creating and the person you have
          become. Atlas will use your own words to
          shape your direction and first mission.
        </p>
      </div>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder="For example: I have built a strong career in technology, developed valuable AI skills, and use my work to solve meaningful problems in Africa..."
        maxLength={1200}
        className="mt-12 h-56 w-full resize-none rounded-3xl border border-white/10 bg-white/5 p-6 text-lg leading-8 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500"
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Be specific about the future you want.
        </p>

        <p className="text-sm text-slate-500">
          {value.length}/1200
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={
            value.trim().length < 20
          }
          className="rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Build My Compass →
        </button>
      </div>
    </motion.div>
  );
}