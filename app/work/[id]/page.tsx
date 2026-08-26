import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, WalletCards } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { getAppliedPaidMissionIds, getPublishedPaidMission, getWorkAccess } from "@/lib/ascend-work/service";
import ApplyPaidMissionButton from "../ApplyPaidMissionButton";
import WorkNavigationLink from "../WorkNavigationLink";

function money(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountMinor / 100);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(value));
}

export default async function PaidMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;

  const [project, access, appliedIds] = await Promise.all([
    getPublishedPaidMission(id),
    getWorkAccess(userId),
    getAppliedPaidMissionIds(userId),
  ]);
  if (!project) notFound();

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
          <WorkNavigationLink href="/work" replace className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft size={16} />Back to ASCEND Work</WorkNavigationLink>
          <header className="mt-6 rounded-3xl border border-cyan-400/20 bg-slate-900/65 p-6 sm:p-8">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-1 text-xs font-semibold text-cyan-200">{project.category}</span>
            <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">{project.title}</h1>
            <p className="mt-2 font-semibold text-slate-300">{project.organizationName}</p>
            <p className="mt-5 text-base leading-7 text-slate-300">{project.summary}</p>
            <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <span className="flex items-center gap-2 text-sm text-emerald-200"><WalletCards size={17} />{money(project.paymentAmountMinor, project.currency)}</span>
              <span className="flex items-center gap-2 text-sm text-blue-200"><Clock3 size={17} />{project.estimatedHours} estimated hours</span>
              <span className="flex items-center gap-2 text-sm text-slate-300"><CalendarDays size={17} />Apply by {date(project.applicationDeadline)}</span>
              <span className="text-sm text-slate-400">{project.availableSlots} {project.availableSlots === 1 ? "place" : "places"}</span>
            </div>
          </header>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-bold text-white">Project brief</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{project.description}</p></section>
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-bold text-white">Required skills</h2><div className="mt-4 flex flex-wrap gap-2">{project.requiredSkills.map((skill) => <span key={skill} className="rounded-full border border-blue-400/20 bg-blue-400/[0.06] px-3 py-1.5 text-xs font-semibold text-blue-200">{skill}</span>)}</div></section>
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-bold text-white">Expected deliverables</h2><ul className="mt-4 space-y-3">{project.deliverables.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={17} />{item}</li>)}</ul><p className="mt-5 text-sm text-slate-500">Final delivery deadline: {date(project.deliveryDeadline)}</p></section>
            </div>
            <aside className="lg:sticky lg:top-6"><ApplyPaidMissionButton projectId={project.id} hasAccess={access.active} alreadyApplied={appliedIds.has(project.id)} /></aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
