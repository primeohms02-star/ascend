"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Discover Yourself",
    description:
      "Understand your strengths, values and what truly matters to you.",
  },
  {
    title: "Explore Opportunities",
    description:
      "Browse career paths, businesses and learning opportunities tailored for you.",
  },
  {
    title: "Take Action",
    description:
      "Turn uncertainty into a clear roadmap with practical next steps.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="max-w-6xl mx-auto py-24 px-6"
    >
      <div className="text-center mb-14">
        <p className="uppercase tracking-[0.3em] text-gray-500 text-sm">
          Features
        </p>

        <h2 className="text-4xl font-bold mt-3">
          Everything you need to move forward
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.15,
            }}
            whileHover={{
              y: -8,
              transition: { duration: 0.2 },
            }}
            className="rounded-2xl border border-gray-200 p-8 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl mb-6">
              ✓
            </div>

            <h3 className="text-2xl font-semibold mb-4">
              {feature.title}
            </h3>

            <p className="text-gray-600 leading-7">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}