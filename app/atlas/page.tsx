import Link from "next/link";
import AtlasChat from "@/app/components/atlas/AtlasChat";

export default function AtlasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
              ASCEND AI
            </p>

            <h1 className="mt-2 text-5xl font-bold">
              Atlas
            </h1>

            <p className="mt-3 text-slate-400">
              Your personal strategic advisor.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-4 py-2 transition hover:bg-slate-900"
          >
            Dashboard
          </Link>

        </div>

        {/* Chat Card */}

        <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <AtlasChat />

        </div>

      </div>
    </main>
  );
}