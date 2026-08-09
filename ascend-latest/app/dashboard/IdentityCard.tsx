type IdentityCardProps = {
  title: string;
  level: number;
};

function IdentityIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 21c0-4.4 2.7-7 7-7s7 2.6 7 7"
      />
    </svg>
  );
}

export default function IdentityCard({
  title,
  level,
}: IdentityCardProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[0.07] via-slate-900/80 to-slate-950 p-5 shadow-xl shadow-violet-950/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Evolving Identity
            </p>

            <h2 className="mt-1.5 text-xl font-bold text-white">
              {title}
            </h2>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
            <IdentityIcon />
          </div>
        </div>

        {/* Shared level */}

        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-violet-400/15 bg-violet-400/[0.05] px-4 py-3">
          <span className="text-sm text-slate-400">
            Shared progression
          </span>

          <span className="text-sm font-semibold text-violet-300">
            Level {level}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Each completed mission provides evidence of the
          person you are becoming.
        </p>
      </div>
    </section>
  );
}