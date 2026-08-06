import Link from "next/link";

import CompleteMissionButton from "@/app/components/dashboard/CompleteMissionButton";

type MissionCardProps = {
  title: string;
  description: string;
  missionId: string;
  available: boolean;
  northStar: string;
};

function TargetIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M12 2v3m10 7h-3M12 22v-3M2 12h3"
      />
    </svg>
  );
}

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

export default function MissionCard({
  title,
  description,
  missionId,
  available,
  northStar,
}: MissionCardProps) {
  return (
    <section
      id="mission"
      className="relative scroll-mt-8 overflow-hidden rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-400/[0.08] via-slate-900/80 to-slate-950 p-6 shadow-xl shadow-orange-950/20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Header */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              {available
                ? "Current Mission"
                : "Mission Status"}
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              {available
                ? "Your active mission"
                : "No active mission"}
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10 text-orange-300">
            <TargetIcon />
          </div>
        </div>

        {/* Mission content */}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-base font-semibold leading-7 text-white">
            {title}
          </p>

          {!available && (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Start or update your ASCEND journey to give
              Atlas the direction it needs to prepare your
              next mission.
            </p>
          )}
        </div>

        {available &&
          description && (
            <details className="group mt-4 rounded-2xl border border-white/10 bg-slate-950/30">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-300 transition hover:text-white">
                <span className="flex items-center justify-between gap-4">
                  Why this mission matters

                  <span className="text-slate-500 transition group-open:rotate-180">
                    ↓
                  </span>
                </span>
              </summary>

              <div className="border-t border-white/10 px-4 py-4">
                <p className="text-sm leading-7 text-slate-300">
                  {description}
                </p>

                {northStar && (
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Completing this mission should produce concrete evidence of progress toward your North Star: “{northStar}”
                  </p>
                )}

                <div className="mt-4 rounded-xl border border-blue-400/15 bg-blue-400/[0.07] p-3">
                  <p className="text-sm leading-6 text-slate-300">
                    If any part of this mission is unclear—or you need help completing it—
                    <Link
                      href="/atlas"
                      className="font-semibold text-blue-300 transition hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    >
                      ask Atlas for guidance
                    </Link>
                    . Atlas can help you understand the outcome, plan the steps and work through obstacles without completing the mission for you.
                  </p>
                </div>
              </div>
            </details>
          )}

        <div className="mt-5">
          {available &&
          missionId ? (
            <CompleteMissionButton
              missionId={
                missionId
              }
            />
          ) : (
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-400/10 px-4 py-2.5 text-sm font-semibold text-orange-300 transition hover:bg-orange-400/15 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              Start a New Journey

              <ArrowIcon />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
