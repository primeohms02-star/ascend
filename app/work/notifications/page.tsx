import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { listUserWorkNotifications } from "@/lib/ascend-work/service";
import NotificationList from "./NotificationList";

export default async function WorkNotificationsPage() {
  const { userId } = await auth(); if (!userId) redirect("/sign-in");
  const notifications = await listUserWorkNotifications(userId);
  return <AppShell><main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07121f] to-[#0f172a]"><div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10"><Link href="/work" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft size={16} />Back to ASCEND Work</Link><header className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6 sm:p-8"><Bell className="text-cyan-300" /><p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Work updates</p><h1 className="mt-1 text-3xl font-black text-white">Notifications</h1><p className="mt-3 text-sm leading-6 text-slate-400">Private updates about your Paid Mission applications, workspace and reviews.</p></header><div className="mt-6"><NotificationList initialNotifications={notifications} /></div></div></main></AppShell>;
}
