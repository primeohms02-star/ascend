"use client";

import { motion } from "framer-motion";
import {
  Compass,
  Brain,
  CalendarCheck,
  TrendingUp,
  BookOpen,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Atlas",
    description:
      "Find your direction with personalized guidance that helps you discover where you are and where you're meant to go.",
  },
  {
    icon: Brain,
    title: "Cortex",
    description:
      "Your AI thinking partner for learning, brainstorming, decision making and solving difficult problems.",
  },
  {
    icon: CalendarCheck,
    title: "Navigator",
    description:
      "Turn long-term goals into daily actions with intelligent planning that keeps you moving forward.",
  },
  {
    icon: TrendingUp,
    title: "Momentum",
    description:
      "Track habits, progress and milestones while watching your growth compound over time.",
  },
  {
    icon: BookOpen,
    title: "Reflection",
    description:
      "Capture your thoughts, lessons and experiences so every day becomes an opportunity to improve.",
  },
  {
    icon: Globe,
    title: "Opportunities",
    description:
      "Discover scholarships, internships, grants, competitions and career opportunities tailored to you.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative bg-[#05070B] py-28 px-6"
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-20 text-center">

          <p className="mb-4 text-blue-500 uppercase tracking-[0.3em] text-sm">
            What ASCEND Gives You
          </p>

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Everything you need
            <br />
            to move forward.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-slate-400 text-lg">
            ASCEND combines powerful tools into one intelligent platform,
            helping you discover opportunities, stay focused and keep growing.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -10,
                }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 transition group-hover:bg-blue-500/20">

                  <Icon
                    size={30}
                    className="text-blue-400"
                  />

                </div>

                <h3 className="mb-4 text-2xl font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="leading-8 text-slate-400">
                  {feature.description}
                </p>

              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}