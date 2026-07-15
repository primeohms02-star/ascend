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
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-8 shadow-2xl">

      {/* Ambient Glow */}

      <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Ascension Journey
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            Your Path
          </h2>

          <p className="mt-3 text-slate-400">
            Every milestone brings you closer to becoming the person you're meant to be.
          </p>

        </div>

        <div className="flex items-center justify-between overflow-x-auto pb-2">

          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-1 items-center"
            >

              <div className="flex flex-col items-center min-w-[90px]">

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                  }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300
                    ${
                      step.completed
                        ? "border-blue-500 bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.45)]"
                        : step.current
                        ? "border-blue-400 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                        : "border-slate-700 bg-slate-900 text-slate-500"
                    }`}
                >
                  {step.completed ? "✓" : step.current ? "●" : "○"}
                </motion.div>

                <p
                  className={`mt-4 text-center text-sm font-medium ${
                    step.completed || step.current
                      ? "text-white"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>

              </div>

              {index < steps.length - 1 && (

                <div
                  className={`mx-3 h-1 flex-1 rounded-full ${
                    step.completed
                      ? "bg-gradient-to-r from-sky-400 to-blue-500"
                      : "bg-slate-700"
                  }`}
                />

              )}

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}