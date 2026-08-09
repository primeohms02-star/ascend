import AppShell from "./AppShell";

export default function AppRouteLoading({ label = "Loading" }: { label?: string }) {
  return (
    <AppShell>
      <main
        aria-busy="true"
        aria-live="polite"
        className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]"
      >
        <div className="mx-auto max-w-6xl animate-pulse px-5 py-7 sm:px-6 sm:py-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            {label}
          </p>
          <div className="mt-3 h-8 w-56 rounded-lg bg-white/[0.055]" />
          <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/[0.035]" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="h-44 rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
            <div className="h-44 rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
