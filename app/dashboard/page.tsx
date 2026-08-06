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

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dashboard =
    await getAtlasDashboard(userId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {/* Dashboard header */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              ASCEND Command Center
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Your Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Direction, action, and progress in one place.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <HomeIcon />

            Home
          </Link>
        </header>

        {/* Daily briefing */}

        <section
          aria-label="Daily briefing"
          className="mt-6"
        >
          <DailyBriefingCard
            greeting={
              dashboard.dailyBriefing.greeting
            }
            summary={
              dashboard.dailyBriefing.summary
            }
            focus={
              dashboard.dailyBriefing.focus
            }
            focusDetail={
              dashboard.dailyBriefing.focusDetail
            }
            oracle={
              dashboard.dailyBriefing.oracle
            }
          />
        </section>

        {/* Direction */}

        <section
          aria-labelledby="direction-heading"
          className="mt-6"
        >
          <div className="mb-3 flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Direction
            </p>

            <h2
              id="direction-heading"
              className="text-lg font-semibold text-white"
            >
              Where you are going
            </h2>
          </div>

          {/* Full-width rectangular North Star */}

          <div
            id="compass"
            className="scroll-mt-8"
          >
            <CompassCard
              northStar={
                dashboard.compass.northStar
              }
              alignment={
                dashboard.compass.alignment
              }
            />
          </div>

          <Link
            href="/music"
            className="group relative mt-5 block overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.1] via-violet-950/40 to-slate-950 p-6 transition hover:border-fuchsia-300/40"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl"
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
                  <MusicIcon />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
                  ASCEND Music
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  Build your Music Pathway
                </h2>

                <p className="mt-2 text-sm font-medium text-fuchsia-200">
                  For those interested in the music industry
                </p>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Define your music identity, direction and opportunity focus across Nigeria, Africa and the world.
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-fuchsia-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
                Open Music
                <ArrowIcon />
              </span>
            </div>
          </Link>
        </section>

        {/* Mission and opportunity workspace */}

        <section
          aria-labelledby="action-heading"
          className="mt-6"
        >
          <div className="mb-3 flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              Action
            </p>

            <h2
              id="action-heading"
              className="text-lg font-semibold text-white"
            >
              What to do now
            </h2>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <MissionCard
              title={
                dashboard.mission.title
              }
              description={
                dashboard.mission.description
              }
              missionId={
                dashboard.mission.missionId
              }
              available={
                dashboard.mission.available
              }
              northStar={
                dashboard.compass.northStar
              }
            />

            <Link
              id="opportunities"
              href="/opportunities"
              className="group relative scroll-mt-8 overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.08] via-slate-900/80 to-slate-950 p-6 transition hover:border-emerald-400/35 hover:bg-emerald-400/[0.04]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl"
              />

              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <OpportunityIcon />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Opportunity Workspace
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  Discover your next possibility
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Explore opportunities, evaluate them with
                  Atlas, and build application action plans.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
                  Open Opportunities

                  <ArrowIcon />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Growth */}

        <section
          aria-labelledby="growth-heading"
          className="mt-6"
        >
          <div className="mb-3 flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Growth
            </p>

            <h2
              id="growth-heading"
              className="text-lg font-semibold text-white"
            >
              Evidence of progress
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <AscensionProgress
              ascension={
                dashboard.ascension
              }
            />

            <IdentityCard
              title={
                dashboard.identity.title
              }
              level={
                dashboard.identity.level
              }
            />
          </div>
        </section>

        {/* Momentum */}

        <section
          aria-labelledby="momentum-heading"
          className="mt-6"
        >
          <div className="mb-3 flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Momentum
            </p>

            <h2
              id="momentum-heading"
              className="text-lg font-semibold text-white"
            >
              Recent movement
            </h2>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <ProgressCard
              progress={
                dashboard.progress.progress
              }
              momentum={
                dashboard.progress.momentum
              }
              message={
                dashboard.progress.message
              }
            />

            <AtlasTimeline
              timeline={
                dashboard.timeline
              }
              totalCount={
                dashboard.timelineTotal
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
