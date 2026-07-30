import type {
  Metadata,
} from "next";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "How It Works",

  description:
    "See how ASCEND transforms identity, goals and challenges into a North Star, strategic missions, relevant opportunities and measurable growth.",

  alternates: {
    canonical:
      "https://ascendai.space/how-it-works",
  },
};

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "ASCEND begins by understanding who you are, what you want, what challenges you face and the future you hope to build.",
    outcome:
      "Your identity and current reality become visible.",
  },
  {
    number: "02",
    title: "Define",
    description:
      "Compass analyzes your onboarding answers together and transforms them into a clear personal North Star.",
    outcome:
      "You gain direction without pretending to know your entire future.",
  },
  {
    number: "03",
    title: "Plan",
    description:
      "Atlas considers your North Star, journey, obstacles, progress, memory and current priorities.",
    outcome:
      "Your direction becomes a practical strategy.",
  },
  {
    number: "04",
    title: "Execute",
    description:
      "ASCEND recommends one specific and meaningful mission suited to your current stage.",
    outcome:
      "Strategy becomes focused action.",
  },
  {
    number: "05",
    title: "Navigate",
    description:
      "Relevant opportunities are discovered, matched, ranked and explained according to your actual journey.",
    outcome:
      "You see possibilities that support your direction.",
  },
  {
    number: "06",
    title: "Decide",
    description:
      "Atlas helps you compare opportunities and difficult choices without taking control away from you.",
    outcome:
      "You make clearer and more deliberate decisions.",
  },
  {
    number: "07",
    title: "Reflect",
    description:
      "Your completed missions, reflections, decisions and conversations contribute to long-term personal memory.",
    outcome:
      "ASCEND learns from your journey.",
  },
  {
    number: "08",
    title: "Ascend",
    description:
      "Momentum, XP, identity, streaks and milestones make your development visible over time.",
    outcome:
      "Action becomes evidence of meaningful growth.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicPageShell
      eyebrow="How ASCEND Works"
      title="From uncertainty to direction, action and growth."
      description="ASCEND does not ask you to figure out your entire life at once. It helps you understand your direction and take the most meaningful next step."
    >
      <section className="space-y-6">
        {steps.map(
          (step, index) => (
            <article
              key={step.number}
              className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:grid-cols-[100px_minmax(0,1fr)_minmax(260px,0.7fr)] md:items-center md:p-9"
            >
              <div>
                <p className="text-4xl font-black text-cyan-300/50">
                  {step.number}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {step.title}
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Outcome
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {step.outcome}
                </p>
              </div>
            </article>
          )
        )}
      </section>

      <section className="mt-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
          The ASCEND Cycle
        </p>

        <p className="mx-auto mt-6 max-w-4xl text-2xl font-bold leading-relaxed text-white sm:text-3xl">
          Purpose → North Star → Mission → Tasks
          → Momentum → Memory → Growth → Legacy
        </p>
      </section>
    </PublicPageShell>
  );
}