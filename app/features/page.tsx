import type {
  Metadata,
} from "next";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Features",

  description:
    "Explore ASCEND's Compass, Atlas intelligence, strategic missions, opportunity discovery, momentum tracking and long-term personal memory.",

  alternates: {
    canonical:
      "https://ascendai.space/features",
  },
};

const features = [
  {
    number: "01",
    title: "Compass",
    description:
      "Understand your identity, goals, challenges and future vision. Compass transforms your answers into a meaningful North Star.",
    accent:
      "border-cyan-400/20 bg-cyan-400/[0.05]",
  },
  {
    number: "02",
    title: "Atlas",
    description:
      "Think through difficult decisions with strategic intelligence that understands your direction, journey, progress and previous reflections.",
    accent:
      "border-blue-400/20 bg-blue-400/[0.05]",
  },
  {
    number: "03",
    title: "Strategic Missions",
    description:
      "Receive specific, relevant and actionable missions that connect your current reality to the future you are building.",
    accent:
      "border-indigo-400/20 bg-indigo-400/[0.05]",
  },
  {
    number: "04",
    title: "Opportunities",
    description:
      "Discover jobs, scholarships, grants, fellowships, courses, competitions and programs matched to your actual journey.",
    accent:
      "border-sky-400/20 bg-sky-400/[0.05]",
  },
  {
    number: "05",
    title: "Atlas Decision",
    description:
      "Evaluate opportunities through alignment, upside, effort, timing and potential contribution to your North Star.",
    accent:
      "border-cyan-400/20 bg-cyan-400/[0.05]",
  },
  {
    number: "06",
    title: "Momentum",
    description:
      "See progress, streaks, milestones and completed missions as calm evidence that your direction is becoming real.",
    accent:
      "border-blue-400/20 bg-blue-400/[0.05]",
  },
  {
    number: "07",
    title: "Growth and Identity",
    description:
      "Build Ascension XP and evolve your identity through meaningful action rather than noisy or disconnected gamification.",
    accent:
      "border-indigo-400/20 bg-indigo-400/[0.05]",
  },
  {
    number: "08",
    title: "Reflection and Memory",
    description:
      "Create long-term personal memory through conversations, reflections, decisions and evidence gathered across your journey.",
    accent:
      "border-sky-400/20 bg-sky-400/[0.05]",
  },
  {
    number: "09",
    title: "Support AI",
    description:
      "Diagnose product problems, receive safe troubleshooting guidance and escalate unresolved cases without affecting your strategy.",
    accent:
      "border-cyan-400/20 bg-cyan-400/[0.05]",
  },
];

export default function FeaturesPage() {
  return (
    <PublicPageShell
      eyebrow="ASCEND Features"
      title="Everything connects to the person you are becoming."
      description="ASCEND brings direction, strategic intelligence, meaningful action, opportunity discovery and evidence of growth into one coherent system."
    >
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(
          (feature) => (
            <article
              key={feature.title}
              className={`rounded-3xl border p-7 backdrop-blur-xl ${feature.accent}`}
            >
              <p className="text-sm font-semibold text-cyan-300">
                {feature.number}
              </p>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                {feature.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                {feature.description}
              </p>
            </article>
          )
        )}
      </section>

      <section className="mt-20 rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/[0.1] via-slate-950/90 to-cyan-500/[0.06] p-8 text-center sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          One connected system
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Purpose becomes direction. Direction becomes action. Action becomes growth.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl leading-8 text-slate-400">
          Every ASCEND feature exists to support
          this transformation without replacing
          your judgment or interrupting your life
          unnecessarily.
        </p>
      </section>
    </PublicPageShell>
  );
}