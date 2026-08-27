import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/navigation/AppShell";
import { isAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { listPaidMissionsAdmin } from "@/lib/ascend-work/service";
import { listPartnerLeads } from "@/lib/ascend-work/partners";
import { listScoutSignals } from "@/lib/ascend-work/partner-scout";

import WorkAdminConsole from "./WorkAdminConsole";

export default async function AscendWorkAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!isAscendWorkAdmin(userId)) redirect("/work");
  const [projects, partners, scoutSignals] = await Promise.all([listPaidMissionsAdmin(), listPartnerLeads(), listScoutSignals()]);

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">ASCEND Work Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Controlled pilot operations</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Verify organisations, prepare non-public draft missions and grant controlled pilot access. Drafts never appear in the student catalogue.
            </p>
          </header>

          <WorkAdminConsole initialProjects={projects} initialPartners={partners} initialScoutSignals={scoutSignals} scoutConfigured={Boolean(process.env.TAVILY_API_KEY)} />
        </div>
      </main>
    </AppShell>
  );
}
