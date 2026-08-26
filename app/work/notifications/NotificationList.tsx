"use client";

import Link from "next/link";
import { useState } from "react";

import type { WorkNotification } from "@/lib/ascend-work/types";

export default function NotificationList({ initialNotifications }: { initialNotifications: WorkNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [busy, setBusy] = useState(false);

  async function markRead(notificationId?: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/work/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notificationId ? { notificationId } : {}) });
      if (!response.ok) throw new Error();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => !notificationId || item.id === notificationId ? { ...item, readAt: item.readAt ?? readAt } : item));
    } finally { setBusy(false); }
  }

  if (!notifications.length) return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"><h2 className="font-semibold text-white">No Work notifications yet</h2><p className="mt-2 text-sm text-slate-400">Application and submission updates will appear here.</p></div>;
  const unread = notifications.some((item) => !item.readAt);
  return <section><div className="flex justify-end">{unread ? <button type="button" disabled={busy} onClick={() => void markRead()} className="text-sm font-semibold text-cyan-300 disabled:opacity-50">Mark all as read</button> : null}</div><div className="mt-3 grid gap-3">{notifications.map((item) => <article key={item.id} className={`rounded-2xl border p-5 ${item.readAt ? "border-white/10 bg-white/[0.025]" : "border-cyan-400/25 bg-cyan-400/[0.06]"}`}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-white">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{item.message}</p><p className="mt-2 text-xs text-slate-600">{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p></div>{!item.readAt ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300" aria-label="Unread" /> : null}</div><div className="mt-4 flex flex-wrap gap-4">{item.href ? <Link href={item.href} onClick={() => { if (!item.readAt) void markRead(item.id); }} className="text-sm font-semibold text-cyan-300">Open update</Link> : null}{!item.readAt ? <button type="button" disabled={busy} onClick={() => void markRead(item.id)} className="text-sm font-semibold text-slate-400 disabled:opacity-50">Mark as read</button> : null}</div></article>)}</div></section>;
}
