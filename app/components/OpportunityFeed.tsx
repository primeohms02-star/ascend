"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import OpportunityCard from "@/app/opportunities/components/OpportunityCard";

import {
  explainOpportunity,
} from "@/lib/atlas/opportunities/explainer";

import type {
  OpportunityProfile,
} from "@/lib/atlas/opportunities/profile";

import type {
  RankedOpportunity,
} from "@/lib/atlas/opportunities/types";
import type { OpportunityStatus } from "@/lib/atlas/opportunities/memory";
import type {
  OpportunityLocationSelection,
  ResolvedOpportunityLocation,
} from "@/lib/atlas/opportunities/location";

type Props = {
  search: string;
  filter: string;
  location: OpportunityLocationSelection;
  onProfileLocation?: (location: string) => void;
  initialPage?: number;
};

type OpportunityPageResponse = {
  opportunities:
    RankedOpportunity[];

  profile:
    OpportunityProfile;

  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  location: ResolvedOpportunityLocation;
  opportunityStatuses: Record<string, OpportunityStatus>;
};

const PAGE_SIZE = 10;
const OPPORTUNITY_SCROLL_KEY =
  "ascend:opportunities:return-scroll";

function normalizePage(value: number | undefined): number {
  return Number.isInteger(value) && Number(value) > 0
    ? Number(value)
    : 1;
}

function locationKey(location: OpportunityLocationSelection): string {
  return [
    location.mode ?? "all",
    location.query ?? "",
    location.city ?? "",
    location.region ?? "",
    location.country ?? "",
  ].join("|");
}

function addLocationParameters(
  params: URLSearchParams,
  location: OpportunityLocationSelection,
) {
  const mode = location.mode ?? "all";

  if (mode !== "profile") {
    params.set("locationMode", mode);
  }

  if (mode !== "manual" && mode !== "current") {
    return;
  }

  const values = {
    location: location.query,
    city: location.city,
    region: location.region,
    country: location.country,
  };

  for (const [name, value] of Object.entries(values)) {
    if (value?.trim()) {
      params.set(name, value.trim());
    }
  }
}

function buildReturnPath({
  page,
  filter,
  search,
  location,
}: {
  page: number;
  filter: string;
  search: string;
  location: OpportunityLocationSelection;
}): string {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (filter && filter !== "All") {
    params.set("filter", filter);
  }

  if (search) {
    params.set("search", search);
  }

  addLocationParameters(params, location);

  return `/opportunities?${params.toString()}`;
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
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
      />

      <path
        strokeLinecap="round"
        d="m15.5 15.5 4 4M8 10.5h5"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
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
        d="m15 18-6-6 6-6"
      />
    </svg>
  );
}

function ArrowRightIcon() {
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
        d="m9 6 6 6-6 6"
      />
    </svg>
  );
}

export default function OpportunityFeed({
  search,
  filter,
  location,
  onProfileLocation,
  initialPage,
}: Props) {
  const feedTopRef =
    useRef<HTMLDivElement>(null);

  const [
    opportunities,
    setOpportunities,
  ] = useState<
    RankedOpportunity[]
  >([]);

  const [
    profile,
    setProfile,
  ] = useState<
    OpportunityProfile | null
  >(null);

  const [
    opportunityStatuses,
    setOpportunityStatuses,
  ] = useState<Record<string, OpportunityStatus>>({});

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    page,
    setPage,
  ] = useState(
    () => normalizePage(initialPage)
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    hasNextPage,
    setHasNextPage,
  ] = useState(false);

  const [
    hasPreviousPage,
    setHasPreviousPage,
  ] = useState(false);

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState(search);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  const [
    resolvedLocation,
    setResolvedLocation,
  ] = useState<ResolvedOpportunityLocation | null>(null);

  const currentLocationKey = locationKey(location);

  const previousCriteriaRef = useRef({
    search,
    filter,
    location: currentLocationKey,
  });

  const restoredScrollRef =
    useRef(false);

  /*
   * Reset pagination whenever
   * the filter or search changes.
   */

  useEffect(() => {
    const previous =
      previousCriteriaRef.current;

    if (
      previous.search !== search ||
      previous.filter !== filter ||
      previous.location !== currentLocationKey
    ) {
      setPage(1);
    }

    previousCriteriaRef.current = {
      search,
      filter,
      location: currentLocationKey,
    };
  }, [search, filter, currentLocationKey]);

  /*
   * Avoid making a request after
   * every individual keystroke.
   */

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim()
          );
        },
        350
      );

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [search]);

  /*
   * Keep the current opportunity view in the URL.
   * This allows the detail page to return to the
   * exact page, search and filter state.
   */

  useEffect(() => {
    const returnPath =
      buildReturnPath({
        page,
        filter,
        search:
          debouncedSearch,
        location,
      });

    const currentPath =
      `${window.location.pathname}${window.location.search}`;

    if (
      currentPath !== returnPath
    ) {
      window.history.replaceState(
        window.history.state,
        "",
        returnPath
      );
    }
  }, [
    page,
    filter,
    debouncedSearch,
    location,
    currentLocationKey,
  ]);

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadOpportunities() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            page:
              String(page),

            limit:
              String(PAGE_SIZE),

            filter,
          });

        if (debouncedSearch) {
          params.set(
            "search",
            debouncedSearch
          );
        }

        addLocationParameters(params, location);

        const response =
          await fetch(
            `/api/opportunities?${params.toString()}`,
            {
              signal:
                controller.signal,

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Atlas could not load opportunities."
          );
        }

        if (
          !data ||
          !Array.isArray(
            data.opportunities
          ) ||
          !data.profile ||
          typeof data.profile
            .careerGoal !==
            "string" ||
          !Array.isArray(
            data.profile.skills
          )
        ) {
          throw new Error(
            "Atlas received an invalid opportunity response."
          );
        }

        const result =
          data as
            OpportunityPageResponse;

        setOpportunities(
          result.opportunities
        );

        setProfile(
          result.profile
        );

        setResolvedLocation(result.location);

        onProfileLocation?.(result.profile.location ?? "");

        setOpportunityStatuses(
          result.opportunityStatuses ?? {}
        );

        setTotal(
          result.total
        );

        setPage(
          result.page
        );

        setTotalPages(
          result.totalPages
        );

        setHasNextPage(
          result.hasNextPage
        );

        setHasPreviousPage(
          result.hasPreviousPage
        );
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Atlas could not load opportunities."
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadOpportunities();

    return () => {
      controller.abort();
    };
  }, [
    page,
    filter,
    debouncedSearch,
    location,
    currentLocationKey,
    reloadKey,
    onProfileLocation,
  ]);

  /*
   * Restore the previous scroll position after
   * the requested opportunity page has loaded.
   */

  useEffect(() => {
    if (
      loading ||
      restoredScrollRef.current ||
      opportunities.length === 0
    ) {
      return;
    }

    const storedPosition =
      window.sessionStorage.getItem(
        OPPORTUNITY_SCROLL_KEY
      );

    if (!storedPosition) {
      return;
    }

    const scrollPosition =
      Number(storedPosition);

    window.sessionStorage.removeItem(
      OPPORTUNITY_SCROLL_KEY
    );

    restoredScrollRef.current = true;

    if (
      !Number.isFinite(
        scrollPosition
      ) ||
      scrollPosition < 0
    ) {
      return;
    }

    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            window.scrollTo({
              top: scrollPosition,
              behavior: "auto",
            });
          }
        );
      }
    );
  }, [
    loading,
    opportunities.length,
  ]);

  function changePage(
    nextPage: number
  ) {
    if (
      nextPage < 1 ||
      nextPage >
        totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);

    window.requestAnimationFrame(
      () => {
        feedTopRef.current
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }
    );
  }

  function rememberOpportunityPosition() {
    window.sessionStorage.setItem(
      OPPORTUNITY_SCROLL_KEY,
      String(window.scrollY)
    );
  }

  if (loading) {
    return (
      <div
        ref={feedTopRef}
        aria-live="polite"
        aria-label="Atlas is discovering opportunities"
        className="scroll-mt-24 space-y-5"
      >
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>

            <p className="text-sm text-cyan-200">
              Atlas is discovering
              and ranking matched
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
      <div
        ref={feedTopRef}
        className="scroll-mt-24 rounded-3xl border border-rose-400/20 bg-rose-400/[0.06] px-6 py-12 text-center"
      >
        <h3 className="text-lg font-semibold text-white">
          Atlas could not load
          opportunities
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-200/80">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            setReloadKey(
              (current) =>
                current + 1
            )
          }
          className="mt-6 rounded-xl bg-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (
    opportunities.length === 0
  ) {
    return (
      <div
        ref={feedTopRef}
        className="scroll-mt-24 rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/70 text-slate-400">
          <SearchEmptyIcon />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white">
          No matching
          opportunities
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Try changing your search
          or selecting a different
          filter or location.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        ref={feedTopRef}
        className="scroll-mt-24 rounded-3xl border border-rose-400/20 bg-rose-400/[0.06] px-6 py-12 text-center"
      >
        <h3 className="text-lg font-semibold text-white">
          Atlas could not prepare
          your opportunity profile
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-200/80">
          Please reload the page and
          try again.
        </p>

        <button
          type="button"
          onClick={() =>
            setReloadKey(
              (current) =>
                current + 1
            )
          }
          className="mt-6 rounded-xl bg-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  const firstResult =
    (page - 1) *
      PAGE_SIZE +
    1;

  const lastResult =
    Math.min(
      firstResult +
        opportunities.length -
        1,
      total
    );

  const returnPath =
    buildReturnPath({
      page,
      filter,
      search:
        debouncedSearch,
      location,
    });

  return (
    <div
      ref={feedTopRef}
      className="scroll-mt-24"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm text-slate-400"
          aria-live="polite"
        >
          Showing{" "}
          <span className="font-semibold text-white">
            {firstResult}–
            {lastResult}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white">
            {total}
          </span>{" "}
          matched opportunities
        </p>

        <div className="flex items-center gap-3">
          {(debouncedSearch ||
            filter !== "All" ||
            resolvedLocation?.active) && (
            <span className="text-xs text-cyan-300">
              {resolvedLocation?.active
                ? `Near ${resolvedLocation.label}`
                : "Results are filtered"}
            </span>
          )}

          <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
            Page {page} of{" "}
            {totalPages}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {opportunities.map(
          (opportunity) => {
            const insight =
              explainOpportunity(
                opportunity,
                profile
              );

            return (
              <OpportunityCard
                key={`${opportunity.source}:${opportunity.id}`}
                opportunity={
                  opportunity
                }
                insight={insight}
                returnTo={returnPath}
                onOpenOpportunity={
                  rememberOpportunityPosition
                }
                status={opportunityStatuses[opportunity.id]}
                onStatusChange={(opportunityId, status) => {
                  setOpportunityStatuses((current) => {
                    const updated = { ...current };

                    if (status) {
                      updated[opportunityId] = status;
                    } else {
                      delete updated[opportunityId];
                    }

                    return updated;
                  });
                }}
              />
            );
          }
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Opportunity pagination"
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            type="button"
            onClick={() =>
              changePage(
                page - 1
              )
            }
            disabled={
              !hasPreviousPage
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeftIcon />
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              Page {page} of{" "}
              {totalPages}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {total} matched
              opportunities
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              changePage(
                page + 1
              )
            }
            disabled={
              !hasNextPage
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRightIcon />
          </button>
        </nav>
      )}
    </div>
  );
}
