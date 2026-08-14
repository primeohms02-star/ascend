"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import type { OpportunityLocationSelection } from "@/lib/atlas/opportunities/location";

type ReverseLocationResponse = {
  city: string;
  region: string;
  country: string;
  label: string;
  attribution: string;
  error?: string;
};

type Props = {
  value: OpportunityLocationSelection;
  savedLocation: string;
  onChange: (value: OpportunityLocationSelection) => void;
};

function LocationIcon() {
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
        d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"
      />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="6" />
      <path strokeLinecap="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    </svg>
  );
}

function activeButton(active: boolean) {
  return active
    ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
    : "border-slate-700 bg-slate-950/40 text-slate-400 hover:border-cyan-400/30 hover:text-cyan-200";
}

export default function OpportunityLocationSearch({
  value,
  savedLocation,
  onChange,
}: Props) {
  const [manualLocation, setManualLocation] = useState(
    value.mode === "manual" ? value.query ?? "" : "",
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  function applyManualLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = manualLocation.trim();

    if (!query) {
      setError("Enter a city, state, region, or country.");
      return;
    }

    setError("");
    onChange({ mode: "manual", query });
  }

  async function locateCurrentPosition() {
    if (!navigator.geolocation) {
      setError("Current location is not available in this browser.");
      return;
    }

    setLocating(true);
    setError("");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            maximumAge: 300_000,
            timeout: 12_000,
          });
        },
      );

      const params = new URLSearchParams({
        lat: String(position.coords.latitude),
        lon: String(position.coords.longitude),
      });
      const response = await fetch(`/api/location/reverse?${params}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as ReverseLocationResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "ASCEND could not identify your current city.",
        );
      }

      onChange({
        mode: "current",
        query: data.label,
        city: data.city,
        region: data.region,
        country: data.country,
      });
    } catch (locationError) {
      const permissionDenied =
        typeof locationError === "object" &&
        locationError !== null &&
        "code" in locationError &&
        locationError.code === 1;

      if (permissionDenied) {
        setError(
          "Location permission was not granted. You can enter a location manually instead.",
        );
      } else {
        setError(
          locationError instanceof Error
            ? locationError.message
            : "ASCEND could not identify your current city.",
        );
      }
    } finally {
      setLocating(false);
    }
  }

  const activeLabel =
    value.mode === "profile"
      ? savedLocation
      : value.mode === "manual" || value.mode === "current"
        ? value.query ?? ""
        : "";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-slate-500">
          <LocationIcon />
        </span>
        <p className="text-sm font-semibold text-white">
          Search by location
        </p>
      </div>

      <div
        role="group"
        aria-label="Choose opportunity location"
        className="flex flex-wrap gap-2.5"
      >
        <button
          type="button"
          aria-pressed={value.mode === "profile"}
          onClick={() => {
            setError("");
            onChange({ mode: "profile" });
          }}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${activeButton(value.mode === "profile")}`}
        >
          My saved location
          {savedLocation ? ` · ${savedLocation}` : ""}
        </button>

        <button
          type="button"
          aria-pressed={value.mode === "all"}
          onClick={() => {
            setError("");
            onChange({ mode: "all" });
          }}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${activeButton(value.mode === "all")}`}
        >
          All locations
        </button>

        <button
          type="button"
          aria-pressed={value.mode === "current"}
          disabled={locating}
          onClick={() => void locateCurrentPosition()}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-wait disabled:opacity-60 ${activeButton(value.mode === "current")}`}
        >
          <CrosshairIcon />
          {locating ? "Finding location..." : "Use my current location"}
        </button>
      </div>

      <form
        onSubmit={applyManualLocation}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={manualLocation}
          onChange={(event) => setManualLocation(event.target.value)}
          type="search"
          autoComplete="address-level2"
          placeholder="Enter city, state, region, or country"
          aria-label="Opportunity location"
          className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
        />
        <button
          type="submit"
          className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        >
          Search location
        </button>
      </form>

      {activeLabel ? (
        <p className="mt-2 text-xs leading-5 text-cyan-200">
          Showing matches for {activeLabel}. Exact city matches appear before
          region and country matches.
        </p>
      ) : (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Use your saved profile location, enter another place, or allow a
          one-time foreground location check.
        </p>
      )}

      {value.mode === "current" && activeLabel ? (
        <p className="mt-1 text-[11px] text-slate-600">
          Location data © OpenStreetMap contributors.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs leading-5 text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
