import type {
  Metadata,
} from "next";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "About",

  description:
    "Learn why ASCEND exists and how it helps people discover purpose, define direction and continually ascend toward their highest potential.",

  alternates: {
    canonical:
      "https://ascendai.space/about",
  },
};

const principles = [
  {
    title: "Purpose before productivity",
    description:
      "ASCEND begins with who you are and the future you want to build—not an endless list of disconnected tasks.",
  },
  {
    title: "Direction before action",
    description:
      "Every mission should connect to a meaningful North Star and move your life in a deliberate direction.",
  },
  {
    title: "Transformation before engagement",
    description:
      "Success is measured by meaningful progress, stronger judgment and evidence of growth—not time spent inside the platform.",
  },
  {
    title: "Guidance without control",
    description:
      "Atlas helps you think clearly and act strategically while preserving your independence and personal judgment.",
  },
];

const journey = [
  "Purpose",
  "North Star",
  "Mission",
  "Tasks",
  "Momentum",
  "Memory",
  "Growth",
  "Legacy",
];

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About ASCEND"
      title="Technology should help people become who they are capable of becoming."
      description="ASCEND exists because millions of people possess extraordinary potential but lack the clarity, direction and consistent momentum required to transform that potential into a meaningful life."
    >
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Our Mission
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
            Help every person discover their purpose and define their direction.
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-400">
            ASCEND helps people understand where
            they currently are, define the future
            they want to build and take meaningful
            action toward that future.
          </p>
        </article>

        <article className="rounded-3xl border border-blue-400/20 bg-blue-500/[0.07] p-7 backdrop-blur-xl sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            Our Position
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
            An Operating System for Human Potential.
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-400">
            ASCEND is not merely a productivity
            application, opportunity board or
            chatbot. It is a calm strategic system
            that connects purpose, decisions,
            opportunities, action and growth.
          </p>
        </article>
      </section>

      <section className="mt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            The ASCEND Philosophy
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Every meaningful life follows a hierarchy.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map(
            (item, index) => (
              <div
                key={item}
                className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-6"
              >
                <p className="text-xs font-semibold text-cyan-300">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </p>

                <p className="mt-4 text-xl font-semibold text-white">
                  {item}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="mt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            Engineering Principles
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What we build must remain worthy of the people who trust it.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {principles.map(
            (principle) => (
              <article
                key={principle.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
              >
                <h3 className="text-xl font-semibold text-white">
                  {principle.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {principle.description}
                </p>
              </article>
            )
          )}
        </div>
      </section>
    </PublicPageShell>
  );
}