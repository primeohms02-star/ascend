import Link from "next/link";

type CompassCardProps = {
  northStar: string;
  alignment: number;
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

function AtlasIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-cyan-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3z"
      />
    </svg>
  );
}

function CompassVisual({ alignment }: { alignment: number }) {
  const safeAlignment = Math.max(0, Math.min(100, Math.round(alignment)));
  const needleRotation = (50 - safeAlignment) * 0.24;

  return (
    <div className="relative mx-auto aspect-square w-44 shrink-0 sm:w-48 lg:w-52">
      <div className="absolute inset-0 rounded-full border border-blue-300/20 bg-[radial-gradient(circle_at_50%_42%,rgba(59,130,246,0.15),rgba(2,6,23,0.92)_58%,rgba(2,6,23,1)_76%)] shadow-[inset_0_0_34px_rgba(59,130,246,0.08)]" />

      <svg
        aria-hidden="true"
        viewBox="0 0 220 220"
        className="absolute inset-0 h-full w-full text-blue-200"
      >
        <circle cx="110" cy="110" r="91" fill="none" stroke="currentColor" strokeOpacity="0.16" />
        <circle cx="110" cy="110" r="73" fill="none" stroke="currentColor" strokeOpacity="0.1" />

        {[0, 45, 90, 135].map((angle) => (
          <line
            key={angle}
            x1="110"
            y1="25"
            x2="110"
            y2="195"
            stroke="currentColor"
            strokeOpacity={angle % 90 === 0 ? 0.18 : 0.08}
            transform={`rotate(${angle} 110 110)`}
          />
        ))}

        <text x="110" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill="rgb(125 211 252)">
          N
        </text>
        <text x="202" y="114" textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.72)">
          E
        </text>
        <text x="110" y="210" textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.72)">
          S
        </text>
        <text x="18" y="114" textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.72)">
          W
        </text>

        <g
          style={{
            transform: `rotate(${needleRotation}deg)`,
            transformOrigin: "110px 110px",
          }}
        >
          <polygon points="110,32 121,111 110,99 99,111" fill="rgb(56 189 248)" />
          <polygon points="110,188 121,109 110,121 99,109" fill="rgba(148,163,184,0.28)" />
        </g>

        <circle cx="110" cy="110" r="8" fill="rgb(15 23 42)" stroke="rgb(125 211 252)" strokeOpacity="0.8" />
        <circle cx="110" cy="110" r="3" fill="rgb(186 230 253)" />
      </svg>

      <div className="absolute inset-x-0 bottom-7 text-center">
        <span className="rounded-full border border-blue-300/15 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-blue-200">
          {safeAlignment}% level progress
        </span>
      </div>
    </div>
  );
}

export default function CompassCard({
  northStar,
  alignment,
}: CompassCardProps) {
  const safeAlignment = Math.max(0, Math.min(100, Math.round(alignment)));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#05070B] via-[#0B1220] to-[#111827] shadow-lg shadow-blue-950/15">
      <div className="grid items-center gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
            North Star
          </p>

          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Your direction:
            </h2>

            <p className="break-words text-lg font-bold text-blue-300 sm:text-xl">
              {northStar}
            </p>
          </div>

          <p className="mt-2.5 max-w-2xl text-sm leading-6 text-slate-400">
            The future you are intentionally building through your missions,
            decisions, and opportunities.
          </p>

          <div className="mt-4 lg:hidden">
            <CompassVisual alignment={safeAlignment} />
          </div>

          <div className="mt-4 max-w-xl">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>Current level progress</span>
              <span className="font-semibold text-blue-300">{safeAlignment}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300"
                style={{ width: `${safeAlignment}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/atlas"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              Open Atlas
              <ArrowIcon />
            </Link>

            <div className="flex items-start gap-2 text-sm leading-5 text-slate-400 sm:items-center">
              <AtlasIcon />
              <p>
                Atlas can help you research, plan, solve obstacles, and make
                progress on your mission.
              </p>
            </div>
          </div>
        </div>

        <div className="hidden justify-center lg:flex">
          <CompassVisual alignment={safeAlignment} />
        </div>
      </div>
    </section>
  );
}
