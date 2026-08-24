import type { OpportunityProfile } from "./profile";
import type { Opportunity } from "./types";
import { isOpportunityExpired } from "./deadline";

export type ApplicationReadinessLevel =
  | "Ready to Apply"
  | "Nearly Ready"
  | "Preparation Needed"
  | "Research First";

export type ApplicationReadinessAssessment = {
  score: number;
  level: ApplicationReadinessLevel;
  matchedSkills: string[];
  skillsToVerify: string[];
  experienceRequirement: "advanced" | "intermediate" | "entry" | "unspecified";
  experienceAligned: boolean | null;
};

const NON_SKILL_TAGS = new Set([
  "africa",
  "business",
  "competition",
  "course",
  "fashion",
  "fellowship",
  "finance",
  "global",
  "grant",
  "internship",
  "job",
  "mentorship",
  "music",
  "nigeria",
  "programme",
  "program",
  "remote",
  "scholarship",
  "technology",
  "volunteering",
]);

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalize(value?: string): string {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]+/g, " ")
    .replace(/\s+/g, " ") ?? "";
}

function unique(values: string[]): string[] {
  const items = new Map<string, string>();

  for (const value of values) {
    const clean = value.trim().replace(/\s+/g, " ");
    const key = normalize(clean);

    if (key && !items.has(key)) {
      items.set(key, clean);
    }
  }

  return [...items.values()];
}

function includesSignal(text: string, value: string): boolean {
  const signal = normalize(value);

  return Boolean(signal) && (` ${text} `).includes(` ${signal} `);
}

function extractRequiredSkills(opportunity: Opportunity): string[] {
  const explicitTags = (opportunity.tags ?? []).filter((tag) => {
    const normalized = normalize(tag);
    return normalized.length >= 2 && !NON_SKILL_TAGS.has(normalized);
  });

  const requirementSignals = (opportunity.requirements ?? [])
    .flatMap((requirement) =>
      requirement
        .split(/[,;/]|\s+(?:and|or)\s+/i)
        .map((value) => value.trim())
        .filter((value) => value.length >= 3 && value.length <= 60),
    )
    .filter((value) =>
      /\b(?:skill|experience|knowledge|proficien|ability|certif|degree|diploma|bachelor|master|python|javascript|typescript|react|node|sql|excel|power bi|analysis|account|finance|marketing|design|research|writing|communication|leadership|management|sales|customer|cloud|aws|cyber|machine learning|artificial intelligence)\b/i.test(
        value,
      ),
    );

  return unique([...explicitTags, ...requirementSignals]).slice(0, 12);
}

function detectExperienceRequirement(
  opportunity: Opportunity,
): ApplicationReadinessAssessment["experienceRequirement"] {
  const text = normalize(
    [
      opportunity.title,
      opportunity.description,
      ...(opportunity.requirements ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (/\b(?:senior|lead|manager|director|head|principal|expert)\b/.test(text)) {
    return "advanced";
  }

  if (/\b(?:mid level|mid-level|intermediate|associate|2 years|3 years|4 years)\b/.test(text)) {
    return "intermediate";
  }

  if (/\b(?:entry level|entry-level|graduate|intern|internship|junior|no experience)\b/.test(text)) {
    return "entry";
  }

  return "unspecified";
}

function experienceAlignment(
  required: ApplicationReadinessAssessment["experienceRequirement"],
  current: OpportunityProfile["experienceLevel"],
): boolean | null {
  if (required === "unspecified") return null;
  if (required === "entry") return true;
  if (required === "intermediate") return current !== "beginner";
  return current === "advanced";
}

function getLevel(score: number): ApplicationReadinessLevel {
  if (score >= 85) return "Ready to Apply";
  if (score >= 70) return "Nearly Ready";
  if (score >= 55) return "Preparation Needed";
  return "Research First";
}

export function assessApplicationReadiness(
  opportunity: Opportunity,
  profile: OpportunityProfile,
  matchScore: number,
  qualityScore: number,
): ApplicationReadinessAssessment {
  const requiredSkills = extractRequiredSkills(opportunity);
  const profileSkills = profile.skills ?? [];
  const matchedSkills = requiredSkills.filter((required) => {
    const requiredText = normalize(required);
    return profileSkills.some(
      (skill) =>
        includesSignal(requiredText, skill) ||
        includesSignal(normalize(skill), required),
    );
  });
  const matchedKeys = new Set(matchedSkills.map(normalize));
  const skillsToVerify = requiredSkills.filter(
    (skill) => !matchedKeys.has(normalize(skill)),
  );
  const experienceRequirement = detectExperienceRequirement(opportunity);
  const experienceAligned = experienceAlignment(
    experienceRequirement,
    profile.experienceLevel,
  );

  const matchContribution = clamp(matchScore) * 0.3;
  const qualityContribution = clamp(qualityScore) * 0.1;
  const skillContribution = requiredSkills.length
    ? (matchedSkills.length / requiredSkills.length) * 35
    : 10;
  const experienceContribution =
    experienceAligned === true ? 15 : experienceAligned === false ? 0 : 8;
  const evidenceContribution = profile.skills.length > 0 ? 7 : 0;

  let score = clamp(
    10 +
      matchContribution +
      qualityContribution +
      skillContribution +
      experienceContribution +
      evidenceContribution,
  );

  // A known experience mismatch is a hard readiness constraint. Strong
  // opportunity alignment cannot turn an entry-level profile into evidence of
  // senior eligibility.
  if (experienceAligned === false) {
    score = Math.min(score, 49);
  }

  if (requiredSkills.length >= 2 && matchedSkills.length === 0) {
    score = Math.min(score, 54);
  }

  // An expired posting cannot be application-ready even when the user's
  // background is otherwise aligned. The original source may reopen it, but
  // that must be verified before ASCEND recommends application work.
  if (isOpportunityExpired(opportunity.deadline)) {
    score = Math.min(score, 20);
  }

  return {
    score,
    level: getLevel(score),
    matchedSkills,
    skillsToVerify,
    experienceRequirement,
    experienceAligned,
  };
}
