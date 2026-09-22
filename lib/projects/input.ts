import type { ProjectDifficulty, ProjectType } from "./types";
import { ProjectServiceError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const projectTypes: ProjectType[] = ["practice", "reward"];
const difficulties: ProjectDifficulty[] = ["beginner", "intermediate", "advanced"];

export type ProjectListInput = {
  page: number;
  pageSize: number;
  projectType?: ProjectType;
  difficulty?: ProjectDifficulty;
  category?: string;
  search?: string;
};

export type ProjectSubmissionInput = {
  deliverableResponses: Record<string, string>;
  participantNote: string;
};

function cleanText(value: unknown, maximumLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

export function requireProjectId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new ProjectServiceError("INVALID_REQUEST", "A valid Project ID is required.", 400);
  }
  return value;
}

export function parseProjectListInput(searchParams: URLSearchParams): ProjectListInput {
  const requestedPage = Number(searchParams.get("page"));
  const requestedPageSize = Number(searchParams.get("pageSize"));
  const requestedType = searchParams.get("type");
  const requestedDifficulty = searchParams.get("difficulty");

  return {
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    pageSize:
      Number.isInteger(requestedPageSize) && requestedPageSize > 0
        ? Math.min(requestedPageSize, 24)
        : 12,
    projectType: projectTypes.includes(requestedType as ProjectType)
      ? (requestedType as ProjectType)
      : undefined,
    difficulty: difficulties.includes(requestedDifficulty as ProjectDifficulty)
      ? (requestedDifficulty as ProjectDifficulty)
      : undefined,
    category: cleanText(searchParams.get("category"), 80) || undefined,
    search: cleanText(searchParams.get("search"), 100) || undefined,
  };
}

export function parseProjectSubmissionInput(value: unknown): ProjectSubmissionInput {
  const record = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const rawResponses =
    typeof record.deliverableResponses === "object" && record.deliverableResponses !== null
      ? (record.deliverableResponses as Record<string, unknown>)
      : {};

  const deliverableResponses = Object.fromEntries(
    Object.entries(rawResponses)
      .slice(0, 30)
      .map(([key, response]) => [cleanText(key, 120), cleanText(response, 10_000)])
      .filter(([key, response]) => key.length > 0 && response.length > 0),
  );

  return {
    deliverableResponses,
    participantNote: cleanText(record.participantNote, 5_000),
  };
}
