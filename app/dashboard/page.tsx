import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Orbit,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  BriefcaseBusiness,
  CalendarClock,
} from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { getAtlasDashboard } from "@/lib/atlas/dashboard";
import { loadOnboardingContext } from "@/lib/atlas/onboardingContext";
import { isOnboardingContextComplete } from "@/lib/atlas/onboardingCompletion";
import { getUserWorkOverview } from "@/lib/ascend-work/service";

import DailyBriefingCard from "@/app/dashboard/DailyBriefingCard";
import CompassCard from "@/app/dashboard/CompassCard";
import MissionCard from "@/app/dashboard/MissionCard";

const quickActions = [
  {
    href: "/atlas",
    label: "Ask Atlas",
    detail: "Think through a question or decision.",
    icon: Orbit,
  },
  {
    href: "/action",
    label: "Continue Mission",
    detail: "Work on the action that matters now.",
    icon: Target,
  },
  {
    href: "/opportunities",
    label: "Explore",
    detail: "Discover possibilities beyond ASCEND.",
    icon: Search,
  },
  {
    href: "/progress",
    label: "View Progress",
    detail: "See growth, momentum and milestones.",
    icon: TrendingUp,
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const onboardingContext = await loadOnboardingContext(userId);

  if (!isOnboardingContextComplete(onboardingContext)) {
    redirect("/onboarding");
  }

  const [dashboard, workOverview] = await Promise.all([
    getAtlasDashboard(userId),
    getUserWorkOverview(userId).catch((error) => {
      console.error("Dashboard Work Overview Error:", error);
      return null;
    }),
  ]);

  const activePaidMission = workOverview?.activePaidMission ?? null;

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-8">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Home
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your command centre
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
              See what matters now, where you are going and the evidence of progress you are building.
            </p>
          </header>

          <Link
            href="/progress"
            className="mt-5 grid gap-3 rounded-2xl border border-violet-400/15 bg-violet-400/[0.045] p-4 transition hover:border-violet-300/25 sm:grid-cols-3 sm:items-center"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Ascension</p>
              <p className="mt-1 text-lg font-bold text-white">Level {dashboard.ascension.level}</p>
              <p className="text-xs text-slate-500">
                {dashboard.ascension.title} stage • {dashboard.identity.title} path
              </p>
            </div>
            <div className="sm:border-l sm:border-white/10 sm:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">XP</p>
              <p className="mt-1 text-lg font-bold text-white">{dashboard.ascension.score}</p>
              <p className="text-xs text-slate-500">{dashboard.ascension.progressPercent}% through this level</p>
            </div>
            <div className="flex items-end justify-between gap-4 sm:border-l sm:border-white/10 sm:pl-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Momentum</p>
                <p className="mt-1 text-lg font-bold text-white">{dashboard.progress.momentum}</p>
                <p className="text-xs leading-5 text-slate-500">{dashboard.progress.message}</p>
              </div>
              <ArrowRight size={17} className="mb-1 text-violet-300" aria-hidden="true" />
            </div>
          </Link>

          <section aria-label="Daily briefing" className="mt-4">
            <DailyBriefingCard
              greeting={dashboard.dailyBriefing.greeting}
              summary={dashboard.dailyBriefing.summary}
              focus={dashboard.dailyBriefing.focus}
              focusDetail={dashboard.dailyBriefing.focusDetail}
              oracle={dashboard.dailyBriefing.oracle}
            />
          </section>

          <nav aria-label="Dashboard quick actions" className="mt-4">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300">
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{action.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{action.detail}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <section aria-labelledby="today-action-heading" className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300">Today</p>
                <h2 id="today-action-heading" className="mt-1 text-lg font-semibold text-white">What needs your attention</h2>
              </div>
              <Link href="/action" className="hidden text-sm font-medium text-orange-300 hover:text-orange-200 sm:inline-flex sm:items-center sm:gap-1.5">
                Open Action <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-2">
              <MissionCard
                title={dashboard.mission.title}
                description={dashboard.mission.description}
                missionId={dashboard.mission.missionId}
                available={dashboard.mission.available}
                northStar={dashboard.compass.northStar}
              />

              {activePaidMission ? (
                <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.07] via-slate-900/80 to-slate-950 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Paid Mission</p><h3 className="mt-1 text-xl font-semibold text-white">Your active paid workspace</h3></div>
                    <BriefcaseBusiness size={21} className="text-emerald-300" aria-hidden="true" />
                  </div>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3.5"><p className="break-words text-base font-semibold leading-7 text-white">{activePaidMission.projectTitle}</p><p className="mt-1 text-sm text-slate-400">{activePaidMission.organizationName}</p></div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400"><CalendarClock size={16} className="text-emerald-300" aria-hidden="true" />Due {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(activePaidMission.deliveryDeadline))}</div>
                  <div className="mt-4 flex flex-wrap gap-3"><Link href={`/work/applications/${activePaidMission.applicationId}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950">Open Paid Workspace <ArrowRight size={15} aria-hidden="true" /></Link><Link href="/atlas" className="inline-flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-400/[0.07] px-4 py-2.5 text-sm font-semibold text-blue-200">Ask Atlas</Link></div>
                </article>
              ) : (
                <Link href="/work" className="group rounded-2xl border border-emerald-400/18 bg-emerald-400/[0.045] p-5 transition hover:border-emerald-300/30">
                  <BriefcaseBusiness size={20} className="text-emerald-300" aria-hidden="true" /><p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">ASCEND Work</p><h3 className="mt-1.5 text-lg font-semibold text-white">Turn direction into verified experience</h3><p className="mt-2 text-sm leading-6 text-slate-400">Review available Paid Missions without losing your Growth Mission.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">Open Work <ArrowRight size={15} aria-hidden="true" /></span>
                </Link>
              )}
            </div>
          </section>

          <section aria-labelledby="direction-heading" className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Direction</p>
                <h2 id="direction-heading" className="mt-1 text-lg font-semibold text-white">Where you are going</h2>
              </div>
              <Link href="/direction" className="hidden text-sm font-medium text-cyan-300 hover:text-cyan-200 sm:inline-flex sm:items-center sm:gap-1.5">
                Open Direction <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <CompassCard northStar={dashboard.compass.northStar} alignment={dashboard.compass.alignment} />
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/direction" className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:bg-white/[0.045]">
              <Compass size={18} className="text-cyan-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-white">Direction</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">North Star, Compass and alignment.</p>
            </Link>
            <Link href="/atlas" className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:bg-white/[0.045]">
              <Sparkles size={18} className="text-amber-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-white">Atlas</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Think, decide, plan and reflect.</p>
            </Link>
            <Link href="/library" className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:bg-white/[0.045]">
              <Target size={18} className="text-violet-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-white">Library</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Return to things you chose to keep.</p>
            </Link>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
