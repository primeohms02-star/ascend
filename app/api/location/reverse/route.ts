import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_REVERSE_GEOCODER_URL =
  "https://nominatim.openstreetmap.org/reverse";

const MINIMUM_REQUEST_INTERVAL_MS = 1_050;

let requestQueue = Promise.resolve();
let lastRequestAt = 0;

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
};

type NominatimResponse = {
  address?: NominatimAddress;
  error?: string;
};

function parseCoordinate(
  value: string | null,
  minimum: number,
  maximum: number,
): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    return null;
  }

  return parsed;
}

function clean(value?: string): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.toLowerCase();

    if (!value || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function waitForPublicGeocoderSlot() {
  const waitFor = Math.max(
    0,
    lastRequestAt + MINIMUM_REQUEST_INTERVAL_MS - Date.now(),
  );

  if (waitFor > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitFor));
  }

  lastRequestAt = Date.now();
}

async function scheduleReverseGeocode<T>(operation: () => Promise<T>) {
  const scheduled = requestQueue.then(async () => {
    await waitForPublicGeocoderSlot();
    return operation();
  });

  requestQueue = scheduled.then(
    () => undefined,
    () => undefined,
  );

  return scheduled;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latitude = parseCoordinate(
    request.nextUrl.searchParams.get("lat"),
    -90,
    90,
  );
  const longitude = parseCoordinate(
    request.nextUrl.searchParams.get("lon"),
    -180,
    180,
  );

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 },
    );
  }

  try {
    const endpoint =
      process.env.ASCEND_REVERSE_GEOCODER_URL?.trim() ||
      DEFAULT_REVERSE_GEOCODER_URL;
    const geocoderUrl = new URL(endpoint);

    geocoderUrl.searchParams.set("lat", latitude.toFixed(4));
    geocoderUrl.searchParams.set("lon", longitude.toFixed(4));
    geocoderUrl.searchParams.set("format", "jsonv2");
    geocoderUrl.searchParams.set("addressdetails", "1");
    geocoderUrl.searchParams.set("layer", "address");
    geocoderUrl.searchParams.set("zoom", "10");

    const response = await scheduleReverseGeocode(() =>
      fetch(geocoderUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          Referer: "https://ascendai.space/",
          "User-Agent": "ASCEND/1.0 (https://ascendai.space)",
        },
        next: {
          revalidate: 86_400,
        },
        signal: AbortSignal.timeout(10_000),
      }),
    );

    const data = (await response.json()) as NominatimResponse;

    if (!response.ok || data.error || !data.address) {
      throw new Error(data.error || "Reverse geocoder returned no address.");
    }

    const address = data.address;
    const city = clean(
      address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county,
    );
    const region = clean(
      address.state || address.state_district || address.county,
    );
    const country = clean(address.country);
    const label = unique([city, region, country]).join(", ");

    if (!label) {
      throw new Error("Reverse geocoder returned an incomplete address.");
    }

    return NextResponse.json(
      {
        city,
        region,
        country,
        label,
        attribution: "© OpenStreetMap contributors",
      },
      {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      },
    );
  } catch (error) {
    console.error("Location reverse-geocoding error:", error);

    return NextResponse.json(
      {
        error: "ASCEND could not identify your current city. Try entering it manually.",
      },
      { status: 502 },
    );
  }
}
