"use client";

export default function DashboardHeader() {
  return (
    <header className="mb-8 flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-400">
          Good Morning 👋
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          Welcome back, Prime
        </h1>

        <p className="mt-3 text-slate-400">
          Your future is built one decision at a time.
        </p>
      </div>

      <div className="flex items-center gap-4">

        <button className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition">
          🔔
        </button>

        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          P
        </button>

      </div>

    </header>
  );
}