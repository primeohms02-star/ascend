"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  OpportunityLibraryCategory,
  OpportunityLibraryCounts,
  OpportunityMemoryRecord,
} from "@/lib/atlas/opportunities/memory";
import { createOpportunityRouteId } from "@/lib/atlas/opportunities/reference";

type Props = {
  category: OpportunityLibraryCategory;
  initialOpportunities: OpportunityMemoryRecord[];
  counts: OpportunityLibraryCounts;
};

const categoryDetails = {
  saved: {
    label: "Saved Opportunities",
    shortLabel: "Saved",
    description:
      "Opportunities you saved to investigate and consider later.",
    emptyTitle: "No saved opportunities yet",
    emptyDescription:
      "Save opportunities from your recommendation feed and they will appear here.",
    accent: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  applied: {
    label: "Applied Opportunities",
    shortLabel: "Applied",
    description:
      "Applications you explicitly confirmed as submitted and are still pursuing.",
    emptyTitle: "No applications recorded yet",
    emptyDescription:
      "After you submit an application, confirm it in ASCEND and it will appear here.",
    accent: "text-cyan-300",
    background: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  completed: {
    label: "Completed Opportunities",
    shortLabel: "Completed",
    description:
      "Submitted application journeys that you later completed or closed.",
    emptyTitle: "No completed opportunities yet",
    emptyDescription:
      "Completed application journeys will be collected here.",
    accent: "text-emerald-300",
    background: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
} satisfies Record<
  OpportunityLibraryCategory,
  {
    label: string;
    shortLabel: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    accent: string;
    background: string;
    border: string;
  }
>;

const categories: OpportunityLibraryCategory[] = [
  "saved",
  "applied",
  "completed",
];

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 12H5m6-6-6 6 6 6"
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

function ExternalLinkIcon() {
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
        d="M14 5h5v5m0-5-9 9M19 14v5H5V5h5"
      />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm0 0v16"
      />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h14v16H5V4Zm4 4h6m-6 4h6"
      />
    </svg>
  );
}

export default function OpportunityLibraryView({
  category,
  initialOpportunities,
  counts,
}: Props) {
  const router = useRouter();

  const [opportunities, setOpportunities] =
    useState(initialOpportunities);

  const [libraryCounts, setLibraryCounts] =
    useState(counts);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [applicationOpenedId, setApplicationOpenedId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const currentDetails =
    categoryDetails[category];

  async function markAsCompleted(
    opportunityId: string
  ) {
    try {
      setUpdatingId(opportunityId);
      setError("");

      const response = await fetch(
        "/api/opportunities/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opportunityId,
            status: "completed",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Atlas could not update this opportunity."
        );
      }

      setOpportunities((current) =>
        current.filter(
          (item) =>
            item.opportunity_id !==
            opportunityId
        )
      );

      setLibraryCounts((current) => ({
        ...current,
        applied: Math.max(0, current.applied - 1),
        completed: current.completed + 1,
      }));

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Atlas could not update this opportunity."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeFromLibrary(
    opportunityId: string
  ) {
    try {
      setUpdatingId(opportunityId);
      setError("");

      const params = new URLSearchParams({
        opportunityId,
      });

      const response = await fetch(
        `/api/opportunities/status?${params.toString()}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Atlas could not remove this opportunity from your Library."
        );
      }

      setOpportunities((current) =>
        current.filter(
          (item) =>
            item.opportunity_id !==
            opportunityId
        )
      );

      setLibraryCounts((current) => ({
        ...current,
        [category]: Math.max(
          0,
          current[category] - 1
        ),
      }));

      setApplicationOpenedId(null);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Atlas could not remove this opportunity from your Library."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function openApplication(
    opportunity: OpportunityMemoryRecord
  ) {
    setError("");

    const original =
      opportunity.opportunity;

    if (!original?.url) {
      setError(
        "The original application link is not available for this opportunity."
      );
      return;
    }

    window.open(
      original.url,
      "_blank",
      "noopener,noreferrer"
    );

    if (category === "saved") {
      setApplicationOpenedId(
        opportunity.opportunity_id
      );
    }
  }

  async function confirmSubmitted(
    opportunity: OpportunityMemoryRecord
  ) {
    if (!opportunity.opportunity) {
      return;
    }

    try {
      setUpdatingId(
        opportunity.opportunity_id
      );
      setError("");

      const response = await fetch(
        "/api/opportunities/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opportunity:
              opportunity.opportunity,
            confirmedSubmitted: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Atlas could not record this submitted application."
        );
      }

      setOpportunities((current) =>
        current.filter(
          (item) =>
            item.opportunity_id !==
            opportunity.opportunity_id
        )
      );

      setLibraryCounts((current) => ({
        ...current,
        saved: Math.max(0, current.saved - 1),
        applied: current.applied + 1,
      }));

      setApplicationOpenedId(null);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Atlas could not record this submitted application."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Back navigation */}

      <nav aria-label="Library navigation">
        <Link
          href="/opportunities"
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        >
          <BackArrowIcon />

          Back to Opportunities
        </Link>
      </nav>

      {/* Header */}

      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <LibraryIcon />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              My Opportunity Library
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {currentDetails.label}
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              {currentDetails.description}
            </p>
          </div>
        </div>
      </section>

      {/* Category navigation */}

      <nav
        aria-label="Opportunity library categories"
        className="grid gap-3 sm:grid-cols-3"
      >
        {categories.map((itemCategory) => {
          const details =
            categoryDetails[itemCategory];

          const active =
            itemCategory === category;

          return (
            <Link
              key={itemCategory}
              href={`/opportunities/library/${itemCategory}`}
              aria-current={
                active ? "page" : undefined
              }
              className={`rounded-2xl border p-4 transition ${
                active
                  ? `${details.border} ${details.background}`
                  : "border-slate-700/80 bg-slate-900/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-semibold ${
                    active
                      ? details.accent
                      : "text-slate-300"
                  }`}
                >
                  {details.shortLabel}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    active
                      ? `${details.border} ${details.background} ${details.accent}`
                      : "border-slate-700 bg-slate-800 text-slate-400"
                  }`}
                >
                  {libraryCounts[itemCategory]}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {/* Opportunity records */}

      {opportunities.length > 0 ? (
        <section className="grid gap-5">
          {opportunities.map((opportunity) => {
            const storedOpportunity =
              opportunity.opportunity ?? {
                id: opportunity.opportunity_id,
                title: opportunity.title,
                company: opportunity.company,
                source: opportunity.source,
                tags: [],
              };

            const encodedId = encodeURIComponent(
              createOpportunityRouteId(
                storedOpportunity.id,
                storedOpportunity.snapshotId
              )
            );

            const decisionHref =
              `/opportunities/${encodedId}` +
              `?source=${encodeURIComponent(
                opportunity.source
              )}`;

            const isUpdating =
              updatingId ===
              opportunity.opportunity_id;

            return (
              <article
                key={`${opportunity.source}:${opportunity.opportunity_id}`}
                className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 transition hover:border-cyan-400/20 sm:p-7"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${currentDetails.border} ${currentDetails.background} ${currentDetails.accent}`}
                      >
                        {opportunity.status}
                      </span>

                      <span className="text-xs uppercase tracking-wider text-slate-500">
                        {opportunity.source}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-white sm:text-2xl">
                      {opportunity.title}
                    </h2>

                    <p className="mt-2 text-slate-400">
                      {opportunity.company}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:min-w-[19rem]">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          removeFromLibrary(
                            opportunity.opportunity_id
                          )
                        }
                        disabled={isUpdating}
                        className="rounded-xl border border-rose-400/25 bg-rose-400/[0.07] px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Unsave"}
                      </button>

                      {storedOpportunity.url ? (
                        <a
                          href={storedOpportunity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
                        >
                          <ExternalLinkIcon />
                          Original
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="The original link is unavailable for this older Library record."
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm font-semibold text-slate-500"
                        >
                          <ExternalLinkIcon />
                          Original
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openApplication(
                          opportunity
                        )
                      }
                      disabled={isUpdating}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Apply
                    </button>

                    {category === "applied" && (
                      <button
                        type="button"
                        onClick={() =>
                          markAsCompleted(
                            opportunity.opportunity_id
                          )
                        }
                        disabled={isUpdating}
                        className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Mark Journey Complete"}
                      </button>
                    )}

                    <Link
                      href={decisionHref}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Atlas Decision

                      <ArrowIcon />
                    </Link>

                    {category === "saved" &&
                      applicationOpenedId ===
                        opportunity.opportunity_id && (
                        <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-3">
                          <p className="text-xs leading-5 text-slate-300">
                            Opening the application does not mark it as applied. Confirm only after you actually submit it.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              confirmSubmitted(
                                opportunity
                              )
                            }
                            disabled={isUpdating}
                            className="mt-2 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15 disabled:opacity-60"
                          >
                            {isUpdating
                              ? "Recording..."
                              : "I submitted my application"}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${currentDetails.border} ${currentDetails.background} ${currentDetails.accent}`}
          >
            <EmptyIcon />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            {currentDetails.emptyTitle}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            {currentDetails.emptyDescription}
          </p>

          <Link
            href="/opportunities"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Explore Opportunities

            <ArrowIcon />
          </Link>
        </section>
      )}
    </div>
  );
}
