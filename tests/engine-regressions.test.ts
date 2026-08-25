import assert from "node:assert/strict";
import test from "node:test";

import { assessApplicationReadiness } from "../lib/atlas/opportunities/application-readiness";
import { analyzeOpportunityDeadline, isOpportunityExpired } from "../lib/atlas/opportunities/deadline";
import { filterOpportunities } from "../lib/atlas/opportunities/filter";
import type { OpportunityProfile } from "../lib/atlas/opportunities/profile";
import type { Opportunity } from "../lib/atlas/opportunities/types";
import { isRepeatedMissionTitle } from "../lib/engine/missionSimilarity";
import {
  isUsableMissionTitle,
  normalizeMissionContent,
} from "../lib/atlas/missionContent";
import { normalizeAtlasListArtifacts } from "../lib/atlas/replyFormatting";
import {
  hasPersonalizedSnapshotScore,
  resolveOpportunityMatchScore,
} from "../lib/atlas/opportunities/match-score";

const beginnerProfile: OpportunityProfile = {
  clerkId: "test-user",
  careerGoal: "Build a finance career",
  skills: ["Excel"],
  interests: ["finance"],
  experienceLevel: "beginner",
  education: "Bachelor's degree",
  location: "Lagos, Nigeria",
  preferredCountries: ["Nigeria"],
  remoteOnly: false,
  industries: ["finance"],
  languages: ["English"],
};

const seniorRole: Opportunity = {
  id: "senior-role",
  title: "Senior Investment Director",
  company: "Example Capital",
  description: "Lead investment research and portfolio strategy.",
  requirements: ["10 years of investment management experience", "CFA certification"],
  source: "test",
  location: "Lagos, Nigeria",
  tags: ["finance", "investment management", "CFA"],
};

test("senior-role experience mismatch cannot be application-ready", () => {
  const result = assessApplicationReadiness(seniorRole, beginnerProfile, 98, 95);

  assert.equal(result.experienceRequirement, "advanced");
  assert.equal(result.experienceAligned, false);
  assert.ok(result.score <= 49);
  assert.equal(result.level, "Research First");
});

test("expired opportunities are excluded and readiness-capped", () => {
  const expired = { ...seniorRole, id: "expired", deadline: "2020-01-01" };

  assert.equal(isOpportunityExpired(expired.deadline), true);
  assert.equal(analyzeOpportunityDeadline(expired.deadline).status, "expired");
  assert.deepEqual(filterOpportunities([expired], beginnerProfile), []);
  assert.ok(assessApplicationReadiness(expired, beginnerProfile, 100, 100).score <= 20);
});

test("personalized feeds do not fall back to unrelated opportunities", () => {
  const unrelated: Opportunity = {
    id: "unrelated",
    title: "Marine Biology Field Research",
    company: "Ocean Lab",
    description: "Study coral reef ecology.",
    source: "test",
    location: "Australia",
    tags: ["marine biology", "ecology"],
  };

  assert.deepEqual(filterOpportunities([unrelated], beginnerProfile), []);
});

test("missions with cosmetic title changes are treated as repeated", () => {
  assert.equal(
    isRepeatedMissionTitle("Build Customer Evidence", ["Building Your Customer Evidence"]),
    true,
  );
  assert.equal(
    isRepeatedMissionTitle("Map Finance Requirements", ["Publish a Design Portfolio"]),
    false,
  );
});

test("Atlas reply artifacts become clean numbered and bullet lists", () => {
  const result = normalizeAtlasListArtifacts(
    "1️⃣ Draft (≈150 words).:\n- [ ] Save it.\nWhy these items matter: - **Alignment** with the North Star. - **Confidence** through evidence.\nI finished. a real win.\n“Done.”.",
  );

  assert.equal(
    result,
    "1. Draft (about 150 words):\n• Save it.\nWhy these items matter:\n• **Alignment** with the North Star.\n• **Confidence** through evidence.\nI finished. A real win.\n“Done.”",
  );
  assert.equal(result.includes(":."), false);
});

test("opportunity decision preserves the personalized snapshot match score", () => {
  assert.equal(
    resolveOpportunityMatchScore(
      { score: 68, snapshotId: "629472" },
      54,
    ),
    68,
  );

  assert.equal(
    resolveOpportunityMatchScore(
      { score: undefined, snapshotId: undefined },
      54,
    ),
    54,
  );
});

test("mission content removes model markup and retains an actionable outcome", () => {
  const mission = normalizeMissionContent(
    "**Create a Finance Evidence Pack**",
    "### Outcome\n- Build one Excel model.\n- Save a shareable PDF.",
  );

  assert.equal(mission.title, "Create a Finance Evidence Pack");
  assert.equal(mission.description.includes("**"), false);
  assert.equal(mission.description.includes("###"), false);
  assert.match(mission.description, /Build one Excel model/);
  assert.match(mission.description, /Save a shareable PDF/);
  assert.equal(isUsableMissionTitle(mission.title), true);
});

test("mission repetition catches inflections but permits genuinely new work", () => {
  assert.equal(
    isRepeatedMissionTitle("Preparing Finance Interview Evidence", [
      "Prepare Your Finance Interview Evidence",
    ]),
    true,
  );
  assert.equal(
    isRepeatedMissionTitle("Draft Three Tailored Outreach Messages", [
      "Prepare Your Finance Interview Evidence",
    ]),
    false,
  );
});

test("readiness cannot be inflated when required skills are unverified", () => {
  const result = assessApplicationReadiness(
    {
      ...seniorRole,
      id: "skills-gap",
      title: "Finance Analyst",
      requirements: ["Power BI experience", "SQL proficiency"],
      tags: ["finance", "Power BI", "SQL"],
    },
    beginnerProfile,
    100,
    100,
  );

  assert.equal(result.matchedSkills.length, 0);
  assert.ok(result.skillsToVerify.length >= 2);
  assert.ok(result.score <= 54);
  assert.notEqual(result.level, "Ready to Apply");
});

test("deadline states distinguish urgent, upcoming, invalid, and absent listings", () => {
  const now = new Date("2026-08-25T12:00:00.000Z");

  assert.equal(analyzeOpportunityDeadline(undefined, now).status, "none");
  assert.equal(analyzeOpportunityDeadline("not-a-date", now).status, "invalid");
  assert.equal(analyzeOpportunityDeadline("2026-08-28", now).status, "urgent");
  assert.equal(analyzeOpportunityDeadline("2026-09-10", now).status, "soon");
  assert.equal(analyzeOpportunityDeadline("2026-12-31", now).status, "open");
});

test("relevant finance opportunities remain while unrelated listings stay excluded", () => {
  const relevant: Opportunity = {
    id: "finance-analyst",
    title: "Graduate Finance Analyst",
    company: "Example Bank",
    description: "Build financial models and support investment analysis.",
    source: "test",
    location: "Lagos, Nigeria",
    category: "job",
    tags: ["finance", "Excel"],
  };

  const filtered = filterOpportunities([relevant], beginnerProfile);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.id, relevant.id);
  assert.ok((filtered[0]?.score ?? 0) > 0);
});

test("snapshot match scores are safely clamped", () => {
  assert.equal(
    resolveOpportunityMatchScore({ score: 120, snapshotId: "snapshot" }, 40),
    100,
  );
  assert.equal(
    resolveOpportunityMatchScore({ score: -10, snapshotId: "snapshot" }, 40),
    0,
  );
});

test("only personalized snapshot scores can bypass detail reranking", () => {
  assert.equal(
    hasPersonalizedSnapshotScore({ score: 68, snapshotId: "snapshot" }),
    true,
  );
  assert.equal(
    hasPersonalizedSnapshotScore({ score: 68, snapshotId: undefined }),
    false,
  );
  assert.equal(
    hasPersonalizedSnapshotScore({ score: Number.NaN, snapshotId: "snapshot" }),
    false,
  );
});
