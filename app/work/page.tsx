import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Clock3, ShieldCheck, WalletCards } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { getAppliedPaidMissionIds, getWorkAccess, listPublishedPaidMissions } from "@/lib/ascend-work/service";
import { isAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";

function money(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountMinor / 100);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AscendWorkPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [access, projects, appliedIds] = await Promise.all([
    getWorkAccess(userId),
    listPublishedPaidMissions(),
    getAppliedPaidMissionIds(userId),
  ]);
  const admin = isAscendWorkAdmin(userId);

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
          <header className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.08] via-slate-900/80 to-blue-500/[0.06] p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><BriefcaseBusiness size={23} aria-hidden="true" /></div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">ASCEND Work</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">Direction that becomes paid, verified experience.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Paid Missions are short, remote projects from verified organisations. Apply through ASCEND, produce real work and turn approved outcomes into evidence of your ability.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-emerald-200">Verified organisations</span>
              <span className="rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3 py-1.5 text-blue-200">Disclosed payment</span>
              <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-3 py-1.5 text-violet-200">Portfolio evidence</span>
            </div>
          </header>

          <section className={`mt-5 rounded-2xl border p-5 ${access.active ? "border-emerald-400/20 bg-emerald-400/[0.05]" : "border-amber-400/20 bg-amber-400/[0.05]"}`}>
            <div className="flex items-start gap-3">
              {access.active ? <BadgeCheck className="mt-0.5 text-emerald-300" size={21} aria-hidden="true" /> : <ShieldCheck className="mt-0.5 text-amber-300" size={21} aria-hidden="true" />}
              <div>
                <h2 className="font-semibold text-white">{access.active ? "Your ASCEND Work access is active" : "Pilot catalogue access"}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {access.active
                    ? access.sponsorName ? `Your access is sponsored by ${access.sponsorName}.` : "You can apply for available Paid Missions that match your abilities."
                    : "You can review Paid Missions, but applications require an active ASCEND subscription or sponsored access."}
                </p>
              </div>
            </div>
            {admin ? (
              <Link href="/work/admin" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                Open Work Admin <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : null}
          </section>

          <section className="mt-9" aria-labelledby="paid-missions-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Verified projects</p>
                <h2 id="paid-missions-heading" className="mt-1 text-2xl font-bold text-white">Available Paid Missions</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Access and matching do not guarantee selection or income.</p>
              </div>
              <Link href="/work/applications" className="inline-flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-400/[0.08] px-4 py-3 text-sm font-bold text-blue-200 transition hover:border-blue-300/40 hover:bg-blue-400/[0.12]">
                My Applications <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {projects.length ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-1 text-xs font-semibold text-cyan-200">{project.category}</span>
                      {appliedIds.has(project.id) ? <span className="text-xs font-semibold text-emerald-300">Applied</span> : null}
                    </div>
                    <h3 className="mt-4 text-xl font-bold leading-7 text-white">{project.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-300">{project.organizationName}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{project.summary}</p>
                    <div className="mt-5 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                      <span className="flex items-center gap-2"><WalletCards size={16} className="text-emerald-300" />{money(project.paymentAmountMinor, project.currency)}</span>
                      <span className="flex items-center gap-2"><Clock3 size={16} className="text-blue-300" />{project.estimatedHours} hours</span>
                      <span className="text-slate-500">Apply by {date(project.applicationDeadline)}</span>
                    </div>
                    <Link href={`/work/${project.id}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200">Review Paid Mission <ArrowRight size={16} aria-hidden="true" /></Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h3 className="font-semibold text-white">The first verified Paid Missions are being prepared</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">ASCEND will publish projects only after the organisation, scope, payment and deliverables pass review.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
