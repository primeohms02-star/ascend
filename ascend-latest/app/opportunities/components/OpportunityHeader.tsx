function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
}

export default function OpportunityHeader() {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 px-6 py-8 shadow-2xl shadow-cyan-950/20 sm:px-8 sm:py-10">
      {/* Background decoration */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
          <CompassIcon />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Atlas Opportunity Engine
        </p>

        <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Discover opportunities that can move you forward.
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
          Atlas discovers, ranks, and explains opportunities so you
          can investigate the right possibilities and make stronger
          decisions about what deserves your time and attention.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <CheckIcon />
            Discover
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            <CheckIcon />
            Evaluate
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
            <CheckIcon />
            Take Action
          </div>
        </div>
      </div>
    </header>
  );
}