import Link from "next/link";
import NightSky from "./compass/NightSky";
import NorthStar from "./compass/NorthStar";
import CompassNeedle from "./compass/CompassNeedle";
import AlignmentBar from "./compass/AlignmentBar";

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

export default function CompassCard({
  northStar,
  alignment,
}: CompassCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#05070B] via-[#0B1220] to-[#111827] shadow-xl shadow-blue-950/20">

      <NightSky />

      <NorthStar />

      <div className="relative z-10 grid items-center gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_230px] lg:px-6">
        {/* North Star content */}

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
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
            The future you are intentionally building through
            your missions, decisions, and opportunities.
          </p>

          {/* Mobile compass */}

          <div className="relative mt-4 flex h-44 items-center justify-center overflow-visible sm:h-52 lg:hidden">
            <div className="origin-center scale-[0.54] sm:scale-[0.64]">
              <CompassNeedle
                alignment={alignment}
              />
            </div>
          </div>

          <div className="mt-4 max-w-xl">
            <AlignmentBar
              alignment={alignment}
            />
          </div>

          {/* Atlas assistance */}

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
                Atlas can help you research, plan, solve
                obstacles, and make progress on your mission.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop compass */}

        <div className="hidden justify-center lg:flex">
          <div className="scale-[0.64]">
            <CompassNeedle
              alignment={alignment}
            />
          </div>
        </div>
      </div>
    </section>
  );
}