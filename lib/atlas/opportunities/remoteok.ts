import { Opportunity } from "./types";

const REMOTE_OK_API = "https://remoteok.com/api";

type RemoteOKJob = {
  id?: string | number;
  position?: string;
  title?: string;
  company?: string;
  description?: string;
  url?: string;
  location?: string;
  tags?: unknown[];
};

export async function fetchRemoteOK(): Promise<Opportunity[]> {
  try {
    const res = await fetch(REMOTE_OK_API, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return (data.slice(1) as RemoteOKJob[]).map((job): Opportunity => ({
      id: String(job.id),

      title: job.position || job.title || "Untitled",

      company: job.company || "Unknown Company",

      description: job.description || "",

      url: job.url || "",

      source: "Remote OK",

      category: "job",

      location: job.location || "Remote",

      remote: true,

      tags: Array.isArray(job.tags)
        ? job.tags.filter((tag): tag is string => typeof tag === "string")
        : [],

      deadline: undefined,

      score: undefined,
    }));
  } catch (error) {
    console.error("Remote OK fetch failed:", error);
    return [];
  }
}
