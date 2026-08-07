import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAtlasDashboard } from "@/lib/atlas/dashboard";

import AtlasTimeline from "@/app/components/dashboard/AtlasTimeline";

import DailyBriefingCard from "@/app/dashboard/DailyBriefingCard";
import CompassCard from "@/app/dashboard/CompassCard";
import MissionCard from "@/app/dashboard/MissionCard";
import IdentityCard from "@/app/dashboard/IdentityCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import AscensionProgress from "@/app/dashboard/AscensionProgress";

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 11 9-8 9 8v9H6v-9m4 9v-6h4v6"
      />
    </svg>
  );
}

function OpportunityIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
      />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 18V5l10-2v13M9 9l10-2M6.5 21C4.6 21 3 19.9 3 18.5S4.6 16 6.5 16 10 17.1 10 18.5 8.4 21 6.5 21Zm10-2c-1.9 0-3.5-1.1-3.5-2.5s1.6-2.5 3.5-2.5 3.5 1.1 3.5 2.5-1.6 2.5-3.5 2.5Z"
      />
    </svg>
  );
}

function AtlasIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 2v3m10 7h-3" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 19V9m7 10V5m7 14v-6M3 19h18"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

const quickActions = [
  {
    href: "/atlas",
    label: "Ask Atlas",
    detail: "Think through a question or decision.",
    icon: AtlasIcon,
    accent: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  },
  {
    href: "#mission",
    label: "Today\u2019s Mission",
    detail: "See the action that matters now.",
    icon: TargetIcon,
    accent: "text-orange-300 bg-orange-400/10 border-orange-400/20",
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    detail: "Explore paths matched to your direction.",
    icon: OpportunityIcon,
    accent: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  },
  {
    href: "#progress",
    label: "My Progress",
    detail: "Review growth, momentum and milestones.",
    icon: ProgressIcon,
    accent: "text-violet-300 bg-violet-400/10 border-violet-400/20",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dashboard = await getAtlasDashboard(userId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              ASCEND Command Center
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              See what matters now, where you are going, and how you are progressing.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <HomeIcon />
            Home
          </Link>
        </header>

        <section aria-label="Daily briefing" className="mt-5">
          <DailyBriefingCard
            greeting={dashboard.dailyBriefing.greeting}
            summary={dashboard.dailyBriefing.summary}
            focus={dashboard.dailyBriefing.focus}
            focusDetail={dashboard.dailyBriefing.focusDetail}
            oracle={dashboard.dailyBriefing.oracle}
          />
        </section>

        <nav aria-label="Dashboard quick actions" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 transition hover:border-white/15 hover:bg-white/[0.055]"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${action.accent}`}
                  >
                    <Icon />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {action.detail}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <section aria-labelledby="action-heading" className="mt-6">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300">
              Start Here
            </p>
            <h2 id="action-heading" className="mt-1 text-lg font-semibold text-white">
              What needs your attention
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete your mission or explore a relevant opportunity.
            </p>
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <MissionCard
              title={dashboard.mission.title}
              description={dashboard.mission.description}
              missionId={dashboard.mission.missionId}
              available={dashboard.mission.available}
              northStar={dashboard.compass.northStar}
            />

            <Link
              id="opportunities"
              href="/opportunities"
              className="group relative scroll-mt-8 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.08] via-slate-900/80 to-slate-950 p-5 transition hover:border-emerald-400/35 hover:bg-emerald-400/[0.04]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
              />

              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <OpportunityIcon />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Opportunity Workspace
                </p>

                <h3 className="mt-1.5 text-lg font-semibold text-white">
                  Discover your next possibility
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Find opportunities, evaluate them with Atlas, and build an action plan.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-3.5 py-2 text-sm font-semibold text-slate-950">
                  Open Opportunities
                  <ArrowIcon />
                </span>
              </div>
            </Link>
          </div>
        </section>

        <section aria-labelledby="direction-heading" className="mt-6">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Your Direction
            </p>
            <h2 id="direction-heading" className="mt-1 text-lg font-semibold text-white">
              Where you are going
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your Compass keeps today\u2019s actions connected to the future you are building.
            </p>
          </div>

          <div id="compass" className="scroll-mt-8">
            <CompassCard
              northStar={dashboard.compass.northStar}
              alignment={dashboard.compass.alignment}
            />
          </div>

          <Link
            href="/music"
            className="group relative mt-4 flex flex-col gap-4 overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/[0.08] via-violet-950/35 to-slate-950 p-4 transition hover:border-fuchsia-300/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="relative flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
                <MusicIcon />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fuchsia-300">
                  ASCEND Music
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">
                  Build your Music Pathway
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  A specialist direction and opportunity pathway for people building in music.
                </p>
              </div>
            </div>

            <span className="relative inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-3.5 py-2 text-sm font-semibold text-fuchsia-200 sm:self-auto">
              Open Music
              <ArrowIcon />
            </span>
          </Link>
        </section>

        <section id="progress" aria-labelledby="progress-heading" className="mt-6 scroll-mt-8">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              Your Progress
            </p>
            <h2 id="progress-heading" className="mt-1 text-lg font-semibold text-white">
              Growth and momentum
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              See the evidence your completed actions are creating over time.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AscensionProgress ascension={dashboard.ascension} />
            <IdentityCard title={dashboard.identity.title} level={dashboard.identity.level} />
          </div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <ProgressCard
              progress={dashboard.progress.progress}
              momentum={dashboard.progress.momentum}
              message={dashboard.progress.message}
            />

            <AtlasTimeline
              timeline={dashboard.timeline}
              totalCount={dashboard.timelineTotal}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
