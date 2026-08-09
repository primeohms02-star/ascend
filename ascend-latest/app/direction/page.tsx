import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/navigation/AppShell";
import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";
import CompassCard from "@/app/dashboard/CompassCard";
import { getDirectionSnapshot } from "@/lib/atlas/dashboard";

export default async function DirectionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const direction = await getDirectionSnapshot(userId);
  const atlasContext = `Direction page. Current North Star: ${direction.northStar}`;

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-9">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Direction</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Know where you are going</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Your North Star and Compass keep your decisions and actions connected to the future you are building.
            </p>
          </header>

          <div className="mt-6">
            <CompassCard northStar={direction.northStar} alignment={direction.alignment} />
          </div>

          <section className="mt-5 grid gap-4 sm:grid-cols-2">
            <Link
              href="/onboarding"
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-400/25 hover:bg-white/[0.05]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Recalibrate</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Update your direction</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Revisit onboarding when your identity, priorities or long-term direction genuinely changes.
              </p>
            </Link>

            <ContextualAtlasLink
              prompt="Help me think about my current direction."
              context={atlasContext}
              className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5 text-left transition hover:border-amber-300/35"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Atlas</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Discuss your direction</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ask Atlas to help you examine trade-offs or uncertainty without changing your North Star automatically.
              </p>
            </ContextualAtlasLink>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
