import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/navigation/AppShell";
import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";
import MissionCard from "@/app/dashboard/MissionCard";
import { getActionSnapshot } from "@/lib/atlas/dashboard";

export default async function ActionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const action = await getActionSnapshot(userId);
  const context = `Action page. Current mission: ${action.mission.title}. Why it matters: ${action.mission.description}`;

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-5xl px-5 py-7 sm:px-6 sm:py-9">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">Action</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Know what to do next</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Your active mission is the concrete action ASCEND is asking you to move forward now.
            </p>
          </header>

          <div className="mt-6">
            <MissionCard
              title={action.mission.title}
              description={action.mission.description}
              missionId={action.mission.missionId}
              available={action.mission.available}
              northStar={action.northStar}
              defaultWhyOpen
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ContextualAtlasLink
              prompt="Help me work through my current mission."
              context={context}
              className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5 text-left transition hover:border-amber-300/35"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Atlas</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Get help with this mission</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Plan the work, research a blocker or think through the next step without changing the mission.</p>
            </ContextualAtlasLink>

            <Link
              href="/opportunities"
              className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5 transition hover:border-emerald-300/35"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Explore</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Look beyond ASCEND</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Discover external possibilities that could support your direction.</p>
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
