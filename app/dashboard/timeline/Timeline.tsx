"use client";

import { motion } from "framer-motion";

const steps = [
  { title: "Discover", completed: true },
  { title: "Direction", completed: true },
  { title: "Skills", current: true },
  { title: "Opportunity" },
  { title: "North Star" },
];

export default function Timeline() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Journey
        </p>

        <h2 className="text-2xl font-bold text-slate-900">
          Your Path
        </h2>
      </div>

      <div className="flex items-center justify-between overflow-x-auto">

        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-1 items-center"
          >
            <div className="flex flex-col items-center">

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2
                  ${
                    step.completed
                      ? "border-orange-500 bg-orange-500 text-white"
                      : step.current
                      ? "border-orange-500 bg-white text-orange-500"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
              >
                {step.completed ? "✓" : step.current ? "●" : "○"}
              </motion.div>

              <p className="mt-3 text-center text-sm font-medium">
                {step.title}
              </p>

            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 rounded-full ${
                  step.completed
                    ? "bg-orange-500"
                    : "bg-slate-300"
                }`}
              />
            )}
          </div>
        ))}

      </div>
    </section>
  );
}