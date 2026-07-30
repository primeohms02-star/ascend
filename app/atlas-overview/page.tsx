import type {
  Metadata,
} from "next";

import Link from "next/link";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Atlas Strategic Intelligence",

  description:
    "Discover Atlas, ASCEND's strategic intelligence for understanding direction, evaluating opportunities and making difficult decisions.",

  alternates: {
    canonical:
      "https://ascendai.space/atlas-overview",
  },
};

const capabilities = [
  {
    title: "Understands your direction",
    description:
      "Atlas considers your North Star, identity, goals, challenges and the future you are working to build.",
  },
  {
    title: "Remembers your journey",
    description:
      "Previous conversations, reflections, missions and decisions contribute to more relevant strategic perspective.",
  },
  {
    title: "Supports difficult decisions",
    description:
      "Atlas helps you compare options, identify tradeoffs and think beyond immediate pressure or popularity.",
  },
  {
    title: "Evaluates opportunities",
    description:
      "Opportunities are examined through alignment, upside, effort, timing and their contribution to your growth.",
  },
  {
    title: "Recommends meaningful action",
    description:
      "Atlas generates missions only when appropriate instead of changing your direction after every conversation.",
  },
  {
    title: "Preserves your judgment",
    description:
      "Atlas guides your thinking but never controls your life, replaces your agency or makes personal decisions for you.",
  },
];

export default function AtlasOverviewPage() {
  return (
    <PublicPageShell
      eyebrow="Meet Atlas"
      title="Strategic intelligence for the journey ahead."
      description="Atlas is the intelligence within ASCEND. It understands your direction, remembers your progress and helps you think clearly when the right path is not obvious."
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.1] to-cyan-500/[0.04] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            More than a chatbot
          </p>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Atlas connects conversation to context, strategy and meaningful action.
          </h2>

          <p className="mt-6 leading-8 text-slate-400">
            Ordinary conversations should not
            replace your mission or artificially
            increase your progress. Atlas keeps
            your active direction stable until a
            genuine mission lifecycle event or
            deliberate request requires change.
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            Atlas Principle
          </p>

          <blockquote className="mt-6 text-3xl font-bold leading-tight text-white">
            “Guide the user. Never control the user.”
          </blockquote>

          <p className="mt-6 leading-8 text-slate-400">
            The final decision remains yours.
            Atlas exists to strengthen judgment,
            reveal tradeoffs and connect choices
            to the future you want to build.
          </p>
        </article>
      </section>

      <section className="mt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            What Atlas Does
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Intelligence grounded in your actual journey.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(
            (capability) => (
              <article
                key={capability.title}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-7"
              >
                <h3 className="text-xl font-semibold text-white">
                  {capability.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {capability.description}
                </p>
              </article>
            )
          )}
        </div>
      </section>

      <section className="mt-20 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/[0.05] p-8 text-center sm:p-12">
        <h2 className="text-3xl font-bold text-white">
          Your direction gives Atlas context.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">
          Complete your Compass, define your
          North Star and begin building a journey
          Atlas can understand.
        </p>

        <Link
          href="/sign-up"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-500"
        >
          Start Your Journey
        </Link>
      </section>
    </PublicPageShell>
  );
}