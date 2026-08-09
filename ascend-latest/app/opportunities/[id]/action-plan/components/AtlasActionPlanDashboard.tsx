"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ApplyOpportunityButton from "@/app/components/ApplyOpportunityButton";
import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";
import ResumeWorkspace from "./ResumeWorkspace";

import type {
  ActionPlanItem,
  ActionPriority,
  AtlasActionPlan,
} from "@/lib/atlas/opportunities/action-plan";
import type { OpportunityStatus } from "@/lib/atlas/opportunities/memory";
import type { Opportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  plan: AtlasActionPlan;
  opportunityId: string;
  opportunityTitle: string;
  opportunity: Opportunity;
  initialStatus: OpportunityStatus | null;
};

type PlanSectionProps = {
  title: string;
  description: string;
  items: ActionPlanItem[];
  completedItems: Set<string>;
  onToggle: (itemId: string) => void;
  accent: "cyan" | "blue" | "amber" | "emerald";
};

const accentStyles = {
  cyan: {
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    dot: "bg-cyan-400",
    checkbox:
      "border-cyan-400/40 checked:border-cyan-400 checked:bg-cyan-400",
  },
  blue: {
    icon: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    dot: "bg-blue-400",
    checkbox:
      "border-blue-400/40 checked:border-blue-400 checked:bg-blue-400",
  },
  amber: {
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    checkbox:
      "border-amber-400/40 checked:border-amber-400 checked:bg-amber-400",
  },
  emerald: {
    icon:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    checkbox:
      "border-emerald-400/40 checked:border-emerald-400 checked:bg-emerald-400",
  },
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function getPriorityStyles(
  priority: ActionPriority
): string {
  if (priority === "High") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }

  if (priority === "Medium") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-slate-600 bg-slate-800 text-slate-400";
}

function ChecklistIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 3 3L19 4M5 20h14"
      />
    </svg>
  );
}

function SkillsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 4 7v5c0 4.8 3.3 7.9 8 9 4.7-1.1 8-4.2 8-9V7l-8-4Zm-3 9 2 2 4-4"
      />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 3h9l4 4v14H6V3Zm9 0v5h4M9 13h6M9 17h6M9 9h2"
      />
    </svg>
  );
}

function InterviewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 2a3 3 0 1 0 0-6m-8 8c-4 0-6 2-6 6h12c0-4-2-6-6-6Zm8 1c3.3 0 5 1.7 5 5"
      />
    </svg>
  );
}

function LearningIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 9 9-5 9 5-9 5-9-5Zm3 3v5c3.5 2.7 8.5 2.7 12 0v-5"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
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

function PlanSection({
  title,
  description,
  items,
  completedItems,
  onToggle,
  accent,
}: PlanSectionProps) {
  const styles = accentStyles[accent];

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          {accent === "cyan" && <ChecklistIcon />}
          {accent === "blue" && <ResumeIcon />}
          {accent === "amber" && <InterviewIcon />}
          {accent === "emerald" && <LearningIcon />}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        {items.map((item) => {
          const completed = completedItems.has(item.id);

          return (
            <label
              key={item.id}
              className={`group flex cursor-pointer gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                completed
                  ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                  : "border-slate-700/80 bg-slate-950/40 hover:border-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={completed}
                onChange={() => onToggle(item.id)}
                className={`mt-1 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border bg-slate-950 transition after:flex after:h-full after:items-center after:justify-center after:text-xs after:font-bold after:text-slate-950 after:content-['✓'] ${styles.checkbox}`}
              />

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-3">
                  <span
                    className={`font-semibold ${
                      completed
                        ? "text-slate-400 line-through"
                        : "text-white"
                    }`}
                  >
                    {item.title}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${getPriorityStyles(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                </span>

                <span
                  className={`mt-2 block text-sm leading-6 ${
                    completed
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  {item.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default function AtlasActionPlanDashboard({
  plan,
  opportunityId,
  opportunityTitle,
  opportunity,
  initialStatus,
}: Props) {
  const storageKey = `ascend-atlas-action-plan:${opportunityId}`;

  const [completedItems, setCompletedItems] =
    useState<Set<string>>(new Set());

  const [hasLoaded, setHasLoaded] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<OpportunityStatus | null>(initialStatus);

  const allItems = useMemo(
    () => [
      ...plan.applicationSteps,
      ...plan.resumeActions,
      ...plan.interviewActions,
      ...plan.learningActions,
    ],
    [plan]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);

      if (saved) {
        const itemIds = JSON.parse(saved);

        if (Array.isArray(itemIds)) {
          setCompletedItems(
            new Set(
              itemIds.filter(
                (item): item is string =>
                  typeof item === "string"
              )
            )
          );
        }
      }
    } catch {
      setCompletedItems(new Set());
    } finally {
      setHasLoaded(true);
    }
  }, [storageKey]);

  function toggleItem(itemId: string) {
    setCompletedItems((currentItems) => {
      const updatedItems = new Set(currentItems);

      if (updatedItems.has(itemId)) {
        updatedItems.delete(itemId);
      } else {
        updatedItems.add(itemId);
      }

      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify([...updatedItems])
        );
      } catch {
        // The checklist still works if browser storage is unavailable.
      }

      return updatedItems;
    });
  }

  const completedCount = allItems.filter((item) =>
    completedItems.has(item.id)
  ).length;

  const progress =
    allItems.length > 0
      ? Math.round(
          (completedCount / allItems.length) * 100
        )
      : 0;

  const readinessScore = clampScore(
    plan.readinessScore
  );

  const scoreDegrees = readinessScore * 3.6;

  const atlasContext = useMemo(
    () =>
      `Atlas Action Plan. Opportunity: ${opportunityTitle}. Organisation: ${opportunity.company}. The user is preparing for this specific opportunity.`,
    [opportunity.company, opportunityTitle]
  );

  const applicationWasSubmitted =
    applicationStatus === "applied" ||
    applicationStatus === "interview" ||
    applicationStatus === "completed" ||
    applicationStatus === "accepted" ||
    applicationStatus === "rejected";

  const applicationJourneyClosed =
    applicationStatus === "completed" ||
    applicationStatus === "accepted" ||
    applicationStatus === "rejected";

  return (
    <div className="space-y-6">
      {/* Action plan header */}

      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <CompassIcon />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Atlas Action Plan
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Your path from decision to application
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ContextualAtlasLink
              prompt={`Help me work through my action plan for ${opportunityTitle}.`}
              context={atlasContext}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300/35 hover:bg-amber-300/[0.1]"
            >
              Ask Atlas about this action plan
            </ContextualAtlasLink>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-300">
                Preparing for
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {opportunityTitle}
              </h1>

              <p className="mt-4 max-w-3xl leading-8 text-slate-300">
                {plan.summary}
              </p>

              <div className="mt-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                {plan.readinessLevel}
              </div>
            </div>

            <div
              role="img"
              aria-label={`Application readiness score: ${readinessScore} out of 100`}
              className="relative mx-auto flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#22d3ee ${scoreDegrees}deg, rgba(51, 65, 85, 0.55) ${scoreDegrees}deg)`,
              }}
            >
              <div className="absolute inset-[9px] rounded-full bg-slate-950" />

              <div className="relative text-center">
                <div>
                  <span className="text-4xl font-bold text-white">
                    {readinessScore}
                  </span>

                  <span className="text-lg text-slate-500">
                    /100
                  </span>
                </div>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Readiness
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress */}

      <section className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Your progress
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              {hasLoaded
                ? `${completedCount} of ${allItems.length} actions completed`
                : "Loading your progress..."}
            </h2>
          </div>

          <p className="text-3xl font-bold text-cyan-300">
            {progress}%
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Progress is saved on this device.
        </p>
      </section>

      {/* Skills assessment */}

      <section className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.045] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <SkillsIcon />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Skills Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Skills Atlas identified and areas you should verify.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-5">
            <h3 className="font-semibold text-white">
              Identified skills
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {plan.skillAssessment.identifiedSkills.length >
              0 ? (
                plan.skillAssessment.identifiedSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <p className="text-sm leading-6 text-slate-400">
                  No specific skills were identified in the
                  available posting.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-5">
            <h3 className="font-semibold text-white">
              Gaps to investigate
            </h3>

            <ul className="mt-4 space-y-3">
              {plan.skillAssessment.gapsToReview.map(
                (gap, index) => (
                  <li
                    key={`${gap}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-slate-400"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

                    <span>{gap}</span>
                  </li>
                )
              )}

              {plan.skillAssessment.gapsToReview.length ===
                0 && (
                <li className="text-sm leading-6 text-slate-400">
                  No major information gaps were identified.
                  Compare the requirements with your own experience.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Action sections */}

      <PlanSection
        title="Application Checklist"
        description="Complete these actions before submitting your application."
        items={plan.applicationSteps}
        completedItems={completedItems}
        onToggle={toggleItem}
        accent="cyan"
      />

      <ResumeWorkspace
        opportunityId={opportunityId}
        opportunityTitle={opportunityTitle}
        company={opportunity.company}
      />

      <PlanSection
        title="Resume Preparation"
        description="Make your experience and evidence relevant to this opportunity."
        items={plan.resumeActions}
        completedItems={completedItems}
        onToggle={toggleItem}
        accent="blue"
      />

      <PlanSection
        title="Interview Preparation"
        description="Prepare the evidence and explanations needed for a strong interview."
        items={plan.interviewActions}
        completedItems={completedItems}
        onToggle={toggleItem}
        accent="amber"
      />

      <PlanSection
        title="Learning Roadmap"
        description="Strengthen important skills and create evidence of your progress."
        items={plan.learningActions}
        completedItems={completedItems}
        onToggle={toggleItem}
        accent="emerald"
      />

      {hasLoaded && progress === 100 && (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.055] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Action plan complete
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {applicationJourneyClosed
              ? "This application journey is complete."
              : applicationWasSubmitted
                ? "Your application is recorded as submitted."
                : "Your preparation is complete. Submit when you are ready."}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            {applicationJourneyClosed
              ? "ASCEND keeps the finished journey in your Library so you can return to it later."
              : applicationWasSubmitted
                ? "Opening an application never changes its status. ASCEND only records Applied after you explicitly confirm that you submitted it."
                : "Open the original application below. It will stay unsubmitted in ASCEND until you confirm that you actually completed the external submission."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {!applicationWasSubmitted && (
              <ApplyOpportunityButton
                opportunity={opportunity}
                onApplied={() => setApplicationStatus("applied")}
              />
            )}

            {applicationWasSubmitted && !applicationJourneyClosed && (
              <Link
                href="/opportunities/library/applied"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
              >
                View submitted application
              </Link>
            )}

            {applicationJourneyClosed && (
              <Link
                href="/opportunities/library/completed"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/15"
              >
                View completed journey
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}