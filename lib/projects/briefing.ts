import { directionMatches } from "./recommendations";
import { milestoneProgress } from "./presentation";

export type BriefingProject = {
  id: string; title: string; category: string; skills: string[];
  project_type: string; status: string; starts_at: string | null;
  join_deadline: string | null; submission_deadline: string; deliverables: string[];
};
export type BriefingParticipation = { project_id: string; status: string; updated_at: string };
export type ProjectBriefing = { title: string; reason: string; nextStep: string; href: string; action: string };

export function selectProjectBriefing(
  direction: string | { northStar: string; identity: string; goal: string; skills: string[] },
  projects: BriefingProject[],
  participations: BriefingParticipation[],
  submissions: { project_id: string; deliverable_responses: Record<string, string> }[],
  now = Date.now(),
): ProjectBriefing | null {
  const available = projects.filter(p => p.project_type === "practice" && p.status === "published"
    && Date.parse(p.submission_deadline) > now
    && (!p.starts_at || Date.parse(p.starts_at) <= now));
  const active = [...participations].filter(p => ["joined", "in_progress", "revision_requested"].includes(p.status))
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  for (const participation of active) {
    const project = available.find(p => p.id === participation.project_id);
    if (!project) continue;
    const responses = submissions.find(s => s.project_id === project.id)?.deliverable_responses ?? {};
    const next = milestoneProgress(project.deliverables, responses).next;
    return {
      title: project.title,
      reason: "Build on the work you have already started.",
      nextStep: participation.status === "revision_requested" ? "Read your reviewer’s feedback and revise your work."
        : next ? `Next milestone: ${next}` : "Review your milestone drafts and reflection before finishing.",
      href: `/projects/${project.id}/workspace`, action: "Continue your project",
    };
  }
  const context = typeof direction === "string" ? { northStar: direction, identity: "", goal: "", skills: [] } : direction;
  const signals = [
    { text: context.northStar, label: "North Star", weight: 4 },
    { text: context.goal, label: "saved goal", weight: 3 },
    { text: context.identity, label: "chosen pathway", weight: 2 },
    { text: context.skills.join(" "), label: "declared skills", weight: 1 },
  ];
  const previouslyJoined = new Set(participations.map(p => p.project_id));
  const ranked = available.filter(p => !previouslyJoined.has(p.id)
    && (!p.join_deadline || Date.parse(p.join_deadline) > now))
    .map(project => {
      const evidence = signals.map(signal => ({ ...signal, matches: directionMatches(signal.text, project) }))
        .filter(signal => signal.matches.length > 0);
      return { project, evidence, score: evidence.reduce((sum, signal) => sum + signal.matches.length * signal.weight, 0) };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.project.id.localeCompare(b.project.id));
  const best = ranked[0];
  if (!best) return null;
  return {
    title: best.project.title,
    reason: `Connects with your ${best.evidence[0].label} through ${best.evidence[0].matches.slice(0, 3).join(", ")}.`,
    nextStep: "Explore the brief and build work you can add to your portfolio.",
    href: `/projects/${best.project.id}`, action: "View project",
  };
}
