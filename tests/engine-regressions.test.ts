import assert from "node:assert/strict";
import test from "node:test";

import { assessApplicationReadiness } from "../lib/atlas/opportunities/application-readiness";
import { analyzeOpportunityDeadline, isOpportunityExpired } from "../lib/atlas/opportunities/deadline";
import { filterOpportunities } from "../lib/atlas/opportunities/filter";
import type { OpportunityProfile } from "../lib/atlas/opportunities/profile";
import type { Opportunity } from "../lib/atlas/opportunities/types";
import { isRepeatedMissionTitle } from "../lib/engine/missionSimilarity";
import { normalizeAtlasListArtifacts } from "../lib/atlas/replyFormatting";

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
    "1️⃣ Complete the draft\nWhy these items matter: - **Alignment** with the North Star. - **Confidence** through evidence.",
  );

  assert.equal(
    result,
    "1. Complete the draft\nWhy these items matter:\n• **Alignment** with the North Star.\n• **Confidence** through evidence.",
  );
  assert.equal(result.includes(":."), false);
});
