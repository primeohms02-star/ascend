import type { RankedOpportunity } from "../atlas/opportunities/types";
import type { OpportunityProfile } from "../atlas/opportunities/profile";
import { createOpportunityRouteId } from "../atlas/opportunities/reference";
import { analyzeOpportunityDeadline } from "../atlas/opportunities/deadline";
import { safePublicLink } from "./types";
export type Pick = {
  id: string;
  title: string;
  company: string;
  reason: string;
  gap: string;
  href: string;
  source: string;
  url: string;
  deadline: string;
};
const broad = new Set(
  "want work with from that this build learn help career become student skills better achieve make people successful success professional would interested opportunities opportunity business strong reliable profitable owner owners grow growth have like stable start improve starting company companies communication leadership management industry field fieldwork develop development experience experienced general programme program training learning gain small future independent motivated pursue pursuing am the and for my an to in of on at is it do as be by or me us we own our your into more about new find get skill level path seeking launch venture ventures young long term funding access explore learn learning plan ideas idea practical starting ongoing opportunity beginner improve improving".split(
    " ",
  ),
);
const tokens = (s: string): string[] =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .match(/[\p{L}\p{N}+#]+/gu) ?? [];
const normalize = (s: string) => tokens(s).join(" ");
const distinct = (xs: string[]) => Array.from(new Set(xs));
const specific = (s: string) => s.length >= 2 && !broad.has(s);
export function pickForDirection(
  page: {
    opportunities: RankedOpportunity[];
    profile: OpportunityProfile;
    snapshotId: string;
  },
  decided: string[],
): Pick[] {
  const seen = new Set(decided);
  const picks: Pick[] = [];
  for (const item of page.opportunities) {
    const url = safePublicLink(item.url);
    if (
      !url ||
      seen.has(item.id) ||
      !Number.isFinite(item.score) ||
      item.score <= 0 ||
      ["expired", "invalid"].includes(
        analyzeOpportunityDeadline(item.deadline).status,
      )
    )
      continue;
    const juniorPath =
      /\b(intern(ship)?|trainee|apprentice(ship)?|course|programme?|training|workshop|mentorship|assistant)\b/i.test(
        item.title,
      );
    if (
      page.profile.experienceLevel === "beginner" &&
      !juniorPath &&
      /\b(senior|director|head of|manager|vp)\b/i.test(item.title)
    )
      continue;
    const goal = distinct(tokens(page.profile.careerGoal).filter(specific));
    const subjects = distinct(
      [
        ...page.profile.interests,
        ...page.profile.industries,
        ...page.profile.skills,
      ]
        .map(normalize)
        .filter((t) => tokens(t).some(specific)),
    );
    // Require a match in the listing's subject itself, not just an incidental requirement.
    const fields = [item.title, item.category ?? "", ...item.tags].map(
      (t) => " " + normalize(t) + " ",
    );
    const mentions = (topic: string) =>
      fields.some((field) => field.includes(" " + topic + " "));
    const goalMatch = goal.filter(mentions);
    if (goal.length && !goalMatch.length) continue;
    const shared = distinct([...goalMatch, ...subjects.filter(mentions)]).slice(
      0,
      2,
    );
    if (!shared.length) continue;
    seen.add(item.id);
    picks.push({
      id: item.id,
      title: item.title,
      company: item.company,
      reason: `The listing mentions ${shared.join(" and ")}, which connects to your saved profile.`,
      gap: item.requirements?.[0]
        ? `Check this requirement: ${item.requirements[0].slice(0, 240)}`
        : "Check eligibility with the organiser before applying.",
      href: `/opportunities/${encodeURIComponent(createOpportunityRouteId(item.id, page.snapshotId))}`,
      source: item.source,
      url,
      deadline: item.deadline || "Not supplied",
    });
    if (picks.length === 3) break;
  }
  return picks;
}
