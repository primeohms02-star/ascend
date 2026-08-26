import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/navigation/AppShell";
import AtlasTimeline from "@/app/components/dashboard/AtlasTimeline";
import AscensionProgress from "@/app/dashboard/AscensionProgress";
import IdentityCard from "@/app/dashboard/IdentityCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import { getProgressSnapshot } from "@/lib/atlas/dashboard";
import { listUserVerifiedWork } from "@/lib/ascend-work/service";
import VerifiedWorkProgressCard from "./VerifiedWorkProgressCard";

export default async function ProgressPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [progress, verifiedWork] = await Promise.all([
    getProgressSnapshot(userId),
    listUserVerifiedWork(userId),
  ]);

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-9">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">Progress</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">See the evidence of your growth</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Ascension, momentum and milestones make the actions you complete visible over time.
            </p>
          </header>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <AscensionProgress ascension={progress.ascension} />
            <IdentityCard
              title={progress.identity.title}
              level={progress.identity.level}
              description={progress.identity.description}
            />
          </div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <ProgressCard
              progress={progress.progress.progress}
              momentum={progress.progress.momentum}
              message={progress.progress.message}
            />
            <AtlasTimeline timeline={progress.timeline} totalCount={progress.timelineTotal} />
          </div>
          <VerifiedWorkProgressCard evidence={verifiedWork} />
        </div>
      </main>
    </AppShell>
  );
}
