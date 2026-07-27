"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import OpportunityCard from "@/app/opportunities/components/OpportunityCard";

import { explainOpportunity } from "@/lib/atlas/opportunities/explainer";

import type { RankedOpportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  search: string;
  filter: string;
};

const temporaryProfile = {
  clerkId: "temporary",
  careerGoal: "AI Engineer",
  skills: [
    "Python",
    "React",
    "Git",
    "TypeScript",
  ],
  interests: [
    "Artificial Intelligence",
    "Technology",
  ],
  experienceLevel: "intermediate" as const,
  education: "",
  location: "Remote",
  preferredCountries: [],
  remoteOnly: true,
  industries: [
    "Technology",
    "AI",
  ],
  languages: ["English"],
};

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-700/70 bg-slate-900/50 p-6">
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1">
          <div className="h-6 w-2/3 rounded-lg bg-slate-800" />

          <div className="mt-3 h-4 w-1/3 rounded-lg bg-slate-800" />
        </div>

        <div className="h-16 w-16 rounded-full bg-slate-800" />
      </div>

      <div className="mt-6 flex gap-2">
        <div className="h-7 w-20 rounded-full bg-slate-800" />
        <div className="h-7 w-24 rounded-full bg-slate-800" />
        <div className="h-7 w-16 rounded-full bg-slate-800" />
      </div>

      <div className="mt-6 h-32 rounded-2xl bg-slate-800/70" />

      <div className="mt-6 h-11 rounded-xl bg-slate-800" />
    </div>
  );
}

function SearchEmptyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />

      <path
        strokeLinecap="round"
        d="m15.5 15.5 4 4M8 10.5h5"
      />
    </svg>
  );
}

export default function OpportunityFeed({
  search,
  filter,
}: Props) {
  const [opportunities, setOpportunities] =
    useState<RankedOpportunity[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOpportunities() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/opportunities",
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Atlas could not load opportunities."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "Atlas received an invalid opportunity response."
          );
        }

        setOpportunities(data);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Atlas could not load opportunities."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadOpportunities();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  const filteredOpportunities = useMemo(
    () =>
      opportunities.filter((opportunity) => {
        const query = normalize(search);

        const category = normalize(
          opportunity.category
        );

        const tags = (
          opportunity.tags ?? []
        ).map(normalize);

        const matchesSearch =
          !query ||
          normalize(
            opportunity.title
          ).includes(query) ||
          normalize(
            opportunity.company
          ).includes(query) ||
          normalize(
            opportunity.description
          ).includes(query) ||
          tags.some((tag) =>
            tag.includes(query)
          );

        const selectedFilter =
          normalize(filter);

        const matchesFilter =
          selectedFilter === "all" ||
          (selectedFilter === "remote" &&
            opportunity.remote === true) ||
          category === selectedFilter ||
          tags.some(
            (tag) => tag === selectedFilter
          );

        return (
          matchesSearch && matchesFilter
        );
      }),
    [opportunities, search, filter]
  );

  if (loading) {
    return (
      <div
        aria-live="polite"
        aria-label="Atlas is discovering opportunities"
        className="space-y-5"
      >
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>

            <p className="text-sm text-cyan-200">
              Atlas is discovering and ranking
              opportunities...
            </p>
          </div>
        </div>

        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-400/20 bg-rose-400/[0.06] px-6 py-12 text-center">
        <h3 className="text-lg font-semibold text-white">
          Atlas could not load opportunities
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-200/80">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            setReloadKey((current) => current + 1)
          }
          className="mt-6 rounded-xl bg-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (filteredOpportunities.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/70 text-slate-400">
          <SearchEmptyIcon />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white">
          No matching opportunities
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Try changing your search or selecting a
          different filter.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm text-slate-400"
          aria-live="polite"
        >
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredOpportunities.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white">
            {opportunities.length}
          </span>{" "}
          opportunities
        </p>

        {(search || filter !== "All") && (
          <p className="text-xs text-cyan-300">
            Results are currently filtered
          </p>
        )}
      </div>

      <div className="space-y-6">
        {filteredOpportunities.map(
          (opportunity) => {
            const insight = explainOpportunity(
              opportunity,
              temporaryProfile
            );

            return (
              <OpportunityCard
                key={`${opportunity.source}:${opportunity.id}`}
                opportunity={opportunity}
                insight={insight}
              />
            );
          }
        )}
      </div>
    </div>
  );
}