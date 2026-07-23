import { SkillMap } from "./skill-map";

export type ReadinessResult = {
  score: number;
  matched: string[];
  missing: string[];
};

export function calculateReadiness(
  northStar: string,
  userSkills: string[]
): ReadinessResult {

  const required =
    SkillMap[northStar.toLowerCase()] ?? [];

  const matched = required.filter(skill =>
    userSkills.some(
      s =>
        s.toLowerCase() ===
        skill.toLowerCase()
    )
  );

  const missing = required.filter(
    skill => !matched.includes(skill)
  );

  const score =
    required.length === 0
      ? 0
      : Math.round(
          (matched.length / required.length) * 100
        );

  return {
    score,
    matched,
    missing,
  };
}