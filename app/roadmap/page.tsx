import PublicPageShell from "@/app/components/PublicPageShell";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata = createPublicPageMetadata({
  title: "Roadmap",
  description:
    "Explore the ASCEND product roadmap, from the live core platform and native app launch to deeper strategic intelligence and human-potential infrastructure.",
  path: "/roadmap",
});

const roadmap = [
  {
    status: "Available",
    title: "ASCEND Core Platform",
    items: [
      "Live web platform and secure authentication",
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
    status: "Launch Ready",
    title: "Native ASCEND App",
    items: [
      "Purpose-built React Native experience",
      "Android and iOS application foundations",
      "Mobile Compass and onboarding",
      "Missions, progress and Atlas on the move",
      "Native opportunity discovery and decisions",
      "ASCEND Music and Support AI",
    ],
    theme:
      "border-indigo-400/20 bg-indigo-400/[0.05] text-indigo-300",
  },
  {
    status: "Next",
    title: "Mobile Launch and Early Validation",
    items: [
      "Play Store and App Store preparation",
      "Early-user onboarding and feedback",
      "Reliability and performance hardening",
      "Useful and restrained notifications",
      "Launch analytics and support readiness",
      "Fast iteration from real user behavior",
    ],
    theme:
      "border-blue-400/20 bg-blue-400/[0.05] text-blue-300",
  },
  {
    status: "Improving",
    title: "Atlas Intelligence and Opportunity Coverage",
    items: [
      "More accurate onboarding analysis",
      "Stronger permanent personal memory",
      "Better mission completion evidence",
      "Deeper opportunity recommendations",
      "Expanded Nigerian, African and global sources",
      "Improved conversation and action separation",
    ],
    theme:
      "border-cyan-400/20 bg-cyan-400/[0.05] text-cyan-300",
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
