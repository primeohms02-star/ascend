import type {
  Metadata,
} from "next";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Roadmap",

  description:
    "Explore the ASCEND product roadmap, from the current web platform to PWA support, mobile applications and deeper strategic intelligence.",

  alternates: {
    canonical:
      "https://ascendai.space/roadmap",
  },
};

const roadmap = [
  {
    status: "Available",
    title: "ASCEND Web Platform",
    items: [
      "Clerk authentication and onboarding",
      "Compass and North Star creation",
      "Strategic daily missions",
      "Atlas conversations and decisions",
      "Global opportunity discovery",
      "Atlas Decision intelligence",
      "Growth, XP and momentum tracking",
      "Support AI and case escalation",
    ],
    theme:
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300",
  },
  {
    status: "Improving",
    title: "Intelligence and Memory",
    items: [
      "More accurate onboarding analysis",
      "Stronger permanent personal memory",
      "Better mission completion evidence",
      "Reduced observation repetition",
      "Deeper opportunity recommendations",
      "Improved conversation and action separation",
    ],
    theme:
      "border-cyan-400/20 bg-cyan-400/[0.05] text-cyan-300",
  },
  {
    status: "Next",
    title: "Progressive Web Application",
    items: [
      "Installable ASCEND experience",
      "Faster repeat loading",
      "Mobile-first navigation improvements",
      "Offline-friendly foundations",
      "Useful and restrained notifications",
      "Improved application-like behavior",
    ],
    theme:
      "border-blue-400/20 bg-blue-400/[0.05] text-blue-300",
  },
  {
    status: "Planned",
    title: "Native Mobile Experience",
    items: [
      "React Native mobile application",
      "Purpose-built mobile interactions",
      "Native notifications",
      "Mobile reflection and mission flow",
      "App Store and Play Store releases",
      "Custom ASCEND animations and brand assets",
    ],
    theme:
      "border-indigo-400/20 bg-indigo-400/[0.05] text-indigo-300",
  },
  {
    status: "Future",
    title: "A Deeper Human Potential System",
    items: [
      "Richer journey and identity models",
      "Long-term legacy planning",
      "Team and community pathways",
      "Expanded global opportunity coverage",
      "Institutional and development partnerships",
      "Research-backed transformation measurement",
    ],
    theme:
      "border-slate-400/20 bg-white/[0.03] text-slate-300",
  },
];

export default function RoadmapPage() {
  return (
    <PublicPageShell
      eyebrow="ASCEND Roadmap"
      title="Building the infrastructure for human potential."
      description="ASCEND is being developed deliberately. Each stage must strengthen direction, judgment, meaningful action and long-term personal growth."
    >
      <section className="space-y-6">
        {roadmap.map(
          (phase, index) => (
            <article
              key={phase.title}
              className={`grid gap-7 rounded-3xl border p-7 md:grid-cols-[180px_minmax(0,1fr)] sm:p-9 ${phase.theme}`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                  {phase.status}
                </p>

                <p className="mt-4 text-4xl font-black opacity-30">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {phase.title}
                </h2>

                <ul className="mt-6 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                  {phase.items.map(
                    (item) => (
                      <li
                        key={item}
                        className="rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </article>
          )
        )}
      </section>

      <p className="mx-auto mt-14 max-w-3xl text-center text-sm leading-7 text-slate-500">
        This roadmap communicates product
        direction rather than guaranteed release
        dates. Priorities may evolve as ASCEND
        learns from users, technical discoveries
        and real-world impact.
      </p>
    </PublicPageShell>
  );
}