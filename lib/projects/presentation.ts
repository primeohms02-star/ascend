import type { ProjectDifficulty, ProjectParticipationStatus, ProjectStatus, ProjectType } from "./types";

export function projectTypeLabel(type: ProjectType) {
  return type === "reward" ? "Historical Project" : "Project";
}

export function projectDifficultyLabel(difficulty: ProjectDifficulty) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function participationStatusLabel(status: ProjectParticipationStatus) {
  const labels: Record<ProjectParticipationStatus, string> = {
    pending: "Awaiting review",
    joined: "Ready to begin",
    in_progress: "In progress",
    submitted: "Submitted",
    revision_requested: "Revision requested",
    completed: "Completed",
    not_completed: "Not completed",
    awarded: "Awarded",
    withdrawn: "Withdrawn",
    disqualified: "Disqualified",
  };
  return labels[status];
}

export function projectStatusLabel(status: ProjectStatus) {
  return status.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function formatProjectDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} hr${hours === 1 ? "" : "s"}`;
}

export function formatProjectDate(value: string | null | undefined) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function evidenceLabel(status: string, reviewer?: string | null) {
  return status === "verified" && reviewer ? "Human reviewed" : "Completed";
}

export function milestoneProgress(deliverables: string[], responses: Record<string,string>) {
  const drafted = deliverables.filter(item=>(responses[item]?.trim().length ?? 0)>=20).length;
  return { drafted, total: deliverables.length, next: deliverables.find(item=>(responses[item]?.trim().length ?? 0)<20) ?? null };
}
