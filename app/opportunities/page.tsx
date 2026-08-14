"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import OpportunityHeader from "./components/OpportunityHeader";
import OpportunityFilters from "./components/OpportunityFilters";
import OpportunityLibrary from "./components/OpportunityLibrary";
import OpportunityLocationSearch from "./components/OpportunityLocationSearch";
import OpportunitySearch from "./components/OpportunitySearch";

import OpportunityFeed from "@/app/components/OpportunityFeed";
import AppShell from "@/app/components/navigation/AppShell";
import PreviousPageButton from "@/app/components/navigation/PreviousPageButton";
import type { OpportunityLocationSelection } from "@/lib/atlas/opportunities/location";

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

function SparkleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7Zm7 13c.3 1.6 1.1 2.4 2.7 2.7-1.6.3-2.4 1.1-2.7 2.7-.3-1.6-1.1-2.4-2.7-2.7 1.6-.3 2.4-1.1 2.7-2.7Z"
      />
    </svg>
  );
}

function OpportunitiesLoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="h-11 w-44 animate-pulse rounded-xl bg-slate-800/70" />
        <div className="mt-8 h-40 animate-pulse rounded-3xl bg-slate-900/60" />
        <div className="mt-10 h-96 animate-pulse rounded-3xl bg-slate-900/60" />
      </div>
    </main>
  );
}

export default function OpportunitiesPage() {
  return (
    <AppShell>
      <Suspense fallback={<OpportunitiesLoadingFallback />}>
        <OpportunitiesContent />
      </Suspense>
    </AppShell>
  );
}

function parseInitialPage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : 1;
}

function parseInitialLocation(
  searchParams: ReturnType<typeof useSearchParams>,
): OpportunityLocationSelection {
  const requestedMode = searchParams.get("locationMode");
  const mode =
    requestedMode === "all" ||
    requestedMode === "manual" ||
    requestedMode === "current" ||
    requestedMode === "profile"
      ? requestedMode
      : "profile";

  return {
    mode,
    query: searchParams.get("location") ?? "",
    city: searchParams.get("city") ?? "",
    region: searchParams.get("region") ?? "",
    country: searchParams.get("country") ?? "",
  };
}

function OpportunitiesContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    () => searchParams.get("search") ?? ""
  );

  const [filter, setFilter] = useState(
    () => searchParams.get("filter") ?? "All"
  );

  const [location, setLocation] = useState<OpportunityLocationSelection>(
    () => parseInitialLocation(searchParams),
  );

  const [savedLocation, setSavedLocation] = useState("");

  const [initialPage] = useState(
    () => parseInitialPage(searchParams.get("page"))
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Back navigation */}

        <nav aria-label="Opportunity navigation">
          <PreviousPageButton
            fallbackHref="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <BackArrowIcon />

            Back
          </PreviousPageButton>
        </nav>

        {/* Page header */}

        <div className="mt-8">
          <OpportunityHeader />
        </div>

        {/* Discovery controls */}

        <section
          aria-label="Opportunity discovery controls"
          className="mt-8 rounded-3xl border border-slate-700/80 bg-slate-900/50 p-5 shadow-xl shadow-slate-950/20 sm:p-6"
        >
          <OpportunitySearch
            value={search}
            onChange={setSearch}
          />

          <div className="mt-5 border-t border-white/10 pt-5">
            <OpportunityLocationSearch
              value={location}
              savedLocation={savedLocation}
              onChange={setLocation}
            />
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <OpportunityFilters
              value={filter}
              onChange={setFilter}
            />
          </div>
        </section>

        {/* Main content */}

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Recommended opportunities */}

          <section aria-labelledby="recommended-opportunities-heading">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <SparkleIcon />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Atlas Discovery
                </p>

                <h2
                  id="recommended-opportunities-heading"
                  className="mt-1 text-2xl font-semibold text-white"
                >
                  Recommended Opportunities
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Explore opportunities ranked using the information
                  currently available to Atlas.
                </p>
              </div>
            </div>

            <OpportunityFeed
              search={search}
              filter={filter}
              location={location}
              onProfileLocation={setSavedLocation}
              initialPage={initialPage}
            />
          </section>

          {/* Opportunity Library */}

          <div className="lg:sticky lg:top-8">
            <OpportunityLibrary />
          </div>
        </div>
      </div>
    </main>
  );
}
