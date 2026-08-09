import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Bookmark, CheckCircle2, Send } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { getOpportunityLibraryCounts } from "@/lib/atlas/opportunities/memory";

const collections = [
  {
    key: "saved" as const,
    label: "Saved",
    description: "Possibilities you intentionally kept so you can investigate or return to them later.",
    icon: Bookmark,
    accent: "text-amber-300 border-amber-400/20 bg-amber-400/[0.06]",
  },
  {
    key: "applied" as const,
    label: "Applied",
    description: "Applications you explicitly confirmed as submitted.",
    icon: Send,
    accent: "text-cyan-300 border-cyan-400/20 bg-cyan-400/[0.06]",
  },
  {
    key: "completed" as const,
    label: "Completed",
    description: "Application journeys you already submitted and later finished or closed.",
    icon: CheckCircle2,
    accent: "text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]",
  },
];

export default async function LibraryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const counts = await getOpportunityLibraryCounts(userId);

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-5xl px-5 py-7 sm:px-6 sm:py-9">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Library</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">What you decided is worth coming back to</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Your Library keeps the external possibilities you saved and the application journeys you chose to pursue.
            </p>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {collections.map((collection) => {
              const Icon = collection.icon;
              return (
                <Link
                  key={collection.key}
                  href={`/opportunities/library/${collection.key}`}
                  className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${collection.accent}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                    <span className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-semibold">
                      {counts[collection.key]}
                    </span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-white">{collection.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{collection.description}</p>
                </Link>
              );
            })}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
