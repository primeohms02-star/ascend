import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { listUserWorkApplications } from "@/lib/ascend-work/service";

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function WorkApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const applications = await listUserWorkApplications(userId);
  return <AppShell><main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]"><div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
    <Link href="/work" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft size={16} />Back to ASCEND Work</Link>
    <header className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6 sm:p-8"><ClipboardList className="text-cyan-300" /><p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Your work</p><h1 className="mt-1 text-3xl font-black text-white">Paid Mission applications</h1><p className="mt-3 text-sm leading-6 text-slate-400">Track selection decisions and open your private workspace after acceptance.</p></header>
    <section className="mt-6 grid gap-4">
      {applications.length ? applications.map((application) => <article key={application.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-white">{application.projectTitle}</h2><p className="mt-1 text-sm text-slate-400">{application.organizationName}</p></div><span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">{statusLabel(application.applicationStatus)}</span></div>{application.submission ? <p className="mt-3 text-sm text-slate-400">Submission: <span className="font-semibold text-slate-200">{statusLabel(application.submission.status)}</span></p> : null}<Link href={`/work/applications/${application.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">View application{application.applicationStatus === "accepted" ? " and workspace" : ""}<ArrowRight size={15} /></Link></article>) : <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"><h2 className="font-semibold text-white">No Paid Mission applications yet</h2><Link href="/work" className="mt-3 inline-flex text-sm font-semibold text-cyan-300">Review available missions</Link></div>}
    </section>
  </div></main></AppShell>;
}
