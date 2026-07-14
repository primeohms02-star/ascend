"use client";

import { motion } from "framer-motion";
import {
  Search,
  Route,
  Rocket,
  Mountain,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description:
      "Understand where you are, your strengths, and the opportunities available to you.",
  },
  {
    number: "02",
    icon: Route,
    title: "Plan",
    description:
      "Create a clear roadmap with goals, habits and daily actions that move you forward.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Execute",
    description:
      "Stay consistent with intelligent guidance, reminders and AI-powered support.",
  },
  {
    number: "04",
    icon: Mountain,
    title: "Ascend",
    description:
      "Measure your growth, unlock new opportunities and become the person you're capable of becoming.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#05070B] px-6 py-28"
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-20 text-center">

          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-500">
            How It Works
          </p>

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Four simple steps.
            <br />
            One extraordinary journey.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            ASCEND isn't another productivity app.
            It's a complete operating system for helping you grow with purpose.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                }}
                className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-blue-500/40"
              >
                <span className="text-6xl font-black text-white/10">
                  {step.number}
                </span>

                <div className="mt-6 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Icon
                    size={30}
                    className="text-blue-400"
                  />
                </div>

                <h3 className="mb-4 text-2xl font-semibold text-white">
                  {step.title}
                </h3>

                <p className="leading-8 text-slate-400">
                  {step.description}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}