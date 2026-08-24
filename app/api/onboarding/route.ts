import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  generateMission,
} from "@/lib/atlas/brain";

import {
  getMissionOperation,
  replaceMissionForOnboarding,
  type OnboardingReplacementResult,
} from "@/lib/atlas/missionService";

import {
  loadOnboardingContext,
  type AtlasOnboardingContext,
} from "@/lib/atlas/onboardingContext";

import {
  invalidateOpportunitySnapshot,
} from "@/lib/atlas/opportunities/service";

import {
  ONBOARDING_ANSWER_LIMITS,
  cleanOnboardingAnswer,
  cleanOnboardingChallenges,
} from "@/lib/onboardingAnswers";

import {
  normalizeMissionContent,
} from "@/lib/atlas/missionContent";
import { consumeAtlasRateLimit } from "@/lib/atlas/rateLimit";

type OnboardingRequest = {
  operationId?: unknown;

  identity?: unknown;

  goal?: unknown;

  skills?: unknown;

  challenges?: unknown;

  northStar?: unknown;
};

type ValidatedAnswers = {
  identity: string;

  goal: string;

  skills: string[];

  challenges: string[];

  northStar: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanSkills(
  value: unknown
): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length > 20 ||
    !value.every(
      (skill) =>
        typeof skill ===
        "string"
    )
  ) {
    return null;
  }

  const uniqueSkills =
    new Map<
      string,
      string
    >();

  for (
    const skillValue of value
  ) {
    const skill =
      (
        skillValue as string
      )
        .trim()
        .replace(
          /\s+/g,
          " "
        );

    if (
      skill.length < 2 ||
      skill.length > 60
    ) {
      return null;
    }

    uniqueSkills.set(
      skill.toLowerCase(),
      skill
    );
  }

  return Array.from(
    uniqueSkills.values()
  ).slice(0, 20);
}

function validateAnswers(
  body: OnboardingRequest
): ValidatedAnswers | null {
  const identity =
    cleanOnboardingAnswer(
      body.identity,
      ONBOARDING_ANSWER_LIMITS.identity
    );

  const goal =
    cleanOnboardingAnswer(
      body.goal,
      ONBOARDING_ANSWER_LIMITS.goal
    );

  if (!identity || !goal) {
    return null;
  }

  const skills =
    cleanSkills(
      body.skills
    );

  if (!skills) {
    return null;
  }

  const challenges =
    cleanOnboardingChallenges(
      body.challenges
    );

  if (!challenges) {
    return null;
  }

  if (
    typeof body.northStar !==
      "string" ||
    body.northStar
      .trim()
      .length < 20 ||
    body.northStar
      .trim()
      .length > 1200
  ) {
    return null;
  }

  return {
    identity,

    goal,

    skills,

    challenges,

    northStar:
      body.northStar.trim(),
  };
}

function formatSkills(
  skills: string[]
): string {
  return skills.length > 0
    ? skills.join(", ")
    : "Still being identified";
}

function buildOnboardingFact(
  answers: ValidatedAnswers
) {
  return [
    `Identity: ${answers.identity}.`,

    `Immediate goal: ${answers.goal}.`,

    `Current skills: ${formatSkills(
      answers.skills
    )}.`,

    `Current challenges: ${answers.challenges.join(
      ", "
    )}.`,

    `North Star: ${answers.northStar}`,
  ].join(" ");
}

function buildExistingOnboardingFact(
  context:
    AtlasOnboardingContext | null
) {
  if (!context) {
    return null;
  }

  return [
    `Identity: ${context.identity}.`,

    `Immediate goal: ${context.goal}.`,

    `Current skills: ${formatSkills(
      context.skills ?? []
    )}.`,

    `Current challenges: ${context.challenges.join(
      ", "
    )}.`,

    `North Star: ${context.north_star}`,
  ].join(" ");
}

function buildFallbackMission(
  answers: ValidatedAnswers
) {
  const missionByGoal:
    Record<
      string,
      {
        title: string;
        outcome: string;
      }
    > = {
      "Find a Job":
        {
          title: "Targeted Job Application",
          outcome: "Identify three roles aligned with your North Star, choose the strongest match and tailor the first section of your resume to its requirements.",
        },

      "Find an Internship":
        {
          title: "Targeted Internship Application",
          outcome: "Find three relevant internships, compare their requirements and prepare one tailored application for the strongest match.",
        },

      "Win a Scholarship":
        {
          title: "Scholarship Requirement Map",
          outcome: "Identify three scholarships that match your background and North Star, then create a requirement checklist for the strongest opportunity.",
        },

      "Join a Fellowship":
        {
          title: "Fellowship Application Outline",
          outcome: "Find three fellowships aligned with your direction, compare their eligibility requirements and outline your application for the strongest match.",
        },

      "Find Grants or Funding":
        {
          title: "Funding Opportunity Shortlist",
          outcome: "Identify three relevant funding opportunities and write a one-paragraph explanation of the problem your project or venture will solve.",
        },

      "Build a Business":
        {
          title: "Customer Assumption Test",
          outcome: "Define the specific customer problem your business will solve and speak with one potential customer to test your most important assumption.",
        },

      "Build a Finance Career":
        {
          title: "Finance Pathway Comparison",
          outcome: "Choose one finance pathway, compare three relevant roles or programmes and identify the two skills most important for your strongest match.",
        },

      "Grow in Fashion":
        {
          title: "Fashion Direction Upgrade",
          outcome: "Choose one fashion direction to strengthen, document your current portfolio or brand position and identify one relevant opportunity to pursue this week.",
        },

      "Learn New Skills":
        {
          title: "Priority Skill Session",
          outcome: "Identify the three most important skills required by your North Star and complete one focused learning session on the highest-priority skill.",
        },

      "Change Careers":
        {
          title: "Career Gap Map",
          outcome: "Choose one target role in your intended career, compare its requirements with your current experience and identify your three most important skill gaps.",
        },

      "Advance My Career":
        {
          title: "Readiness Evidence",
          outcome: "Identify the next role or responsibility you want, document its key requirements and complete one visible action that demonstrates your readiness.",
        },

      "Grow My Freelance Career":
        {
          title: "Freelance Service Offer",
          outcome: "Define one clear freelance service, identify the client problem it solves and create a short offer you can present to one potential client.",
        },

      "Grow as a Creator":
        {
          title: "Audience Value Project",
          outcome: "Choose one audience problem connected to your direction and publish one useful piece of work that demonstrates your creative value.",
        },

      "Build My Network":
        {
          title: "Focused Network Outreach",
          outcome: "Identify three people whose work aligns with your North Star and send one thoughtful, personalized message requesting a focused conversation.",
        },

      "Discover My Purpose":
        {
          title: "Purpose Pattern Review",
          outcome: "Write down three moments when you felt useful, energized or deeply engaged, then identify the common strength or impact connecting them.",
        },
    };

  const selected =
    missionByGoal[answers.goal] ??
    {
      title: "North Star Progress Action",
      outcome: "Choose one concrete action that moves you closer to your North Star and complete it within the next 24 hours.",
    };

  const skillsContext =
    answers.skills.length > 0
      ? ` Atlas can build from your current skills in ${answers.skills.join(
          ", "
        )}.`
      : "";

  return {
    mission: selected.title,

    reason:
      `Outcome: ${selected.outcome}\n\nWhy it matters: You described yourself as ${answers.identity} and selected “${answers.goal}” as your immediate goal.${skillsContext} It addresses your current challenge, “${answers.challenges[0]},” and creates concrete evidence of progress toward your North Star.`,
  };
}

function parseMission(
  response: string
) {
  if (
    !response ||
    response.trim() ===
      "NONE"
  ) {
    return null;
  }

  const rawMission =
    response.match(
      /MISSION:\s*([\s\S]*?)REASON:/i
    )?.[1]?.trim();

  const rawReason =
    response.match(
      /REASON:\s*([\s\S]*)/i
    )?.[1]?.trim();

  if (!rawMission) {
    return null;
  }

  const normalized =
    normalizeMissionContent(
      rawMission,
      rawReason
    );

  return {
    mission:
      normalized.title,

    reason:
      normalized.description,
  };
}

function buildAtlasContext(
  answers: ValidatedAnswers
) {
  const skills =
    answers.skills.length > 0
      ? answers.skills
          .map(
            (skill) =>
              `- ${skill}`
          )
          .join("\n")
      : "- The user is still identifying their skills.";

  return `
The user has explicitly completed ASCEND onboarding.

Current identity:
${answers.identity}

Immediate goal:
${answers.goal}

Current declared skills:
${skills}

Current challenges:
${answers.challenges
  .map(
    (challenge) =>
      `- ${challenge}`
  )
  .join("\n")}

North Star, written in the user's own words:
${answers.northStar}

Create one concrete first mission.

The mission must directly support the immediate goal, move the user toward
the North Star, consider the user's current skills, address at least one
stated challenge, be realistically completable within one day, and produce
visible evidence of progress.

Do not assume the user has skills they did not declare.

The MISSION value must be a plain-language title of 3 to 8 words. It must not be an instruction, paragraph, bullet or Markdown. Do not use asterisks, hashes, quotes or decorative symbols.

Keep the REASON between 60 and 140 words. Organize it with plain-text labels when useful: Outcome:, Steps:, Evidence:, Why it matters:. Put each numbered step on its own line and use no more than three steps. Do not use Markdown formatting.

Return exactly MISSION: followed by the concise title and REASON: followed by the organized explanation.
`;
}

function jsonResult(
  result:
    OnboardingReplacementResult
) {
  return NextResponse.json({
    success: true,

    operationId:
      result.operationId,

    replayed:
      result.replayed,

    isRecalibration:
      result.isRecalibration,

    mission:
      result.activeMission,
  });
}

export async function POST(
  request: NextRequest
) {
  try {
    const {
      userId,
    } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to complete onboarding.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (
        await request.json()
      ) as OnboardingRequest;

    const answers =
      validateAnswers(body);

    if (!answers) {
      return NextResponse.json(
        {
          error:
            "Some onboarding answers are missing or invalid.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.operationId !==
        "string" ||
      !uuidPattern.test(
        body.operationId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid operation ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const operationId =
      body.operationId;

    const existingResult =
      await getMissionOperation<OnboardingReplacementResult>(
        userId,
        operationId,
        "onboarding_replace"
      );

    if (existingResult) {
      return jsonResult(
        existingResult
      );
    }

    const userAllowed = await consumeAtlasRateLimit({
      userId,
      bucket: "onboarding-mission",
      windowSeconds: 600,
      maxRequests: 6,
    });
    const serviceAllowed = userAllowed
      ? await consumeAtlasRateLimit({
          userId: "__ascend_global__",
          bucket: "groq-requests",
          windowSeconds: 60,
          maxRequests: 120,
        })
      : false;

    if (!userAllowed || !serviceAllowed) {
      return NextResponse.json(
        {
          error:
            "ASCEND has received several journey updates in a short period. Wait a moment before trying again.",
          retryable: true,
          operationId,
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const previousContext =
      await loadOnboardingContext(
        userId
      );

    let selectedMission =
      buildFallbackMission(
        answers
      );

    try {
      const generated =
        parseMission(
          await generateMission(
            null,
            answers.northStar,
            buildAtlasContext(
              answers
            )
          )
        );

      if (generated) {
        selectedMission =
          generated;
      }
    } catch (
      generationError
    ) {
      console.error(
        "Onboarding Mission Generation Error:",
        generationError
      );
    }

    try {
      const result =
        await replaceMissionForOnboarding({
          userId,

          operationId,

          identity:
            answers.identity,

          goal:
            answers.goal,

          skills:
            answers.skills,

          challenges:
            answers.challenges,

          northStar:
            answers.northStar,

          directionFact:
            buildOnboardingFact(
              answers
            ),

          previousDirectionFact:
            buildExistingOnboardingFact(
              previousContext
            ),

          mission:
            selectedMission.mission,

          reason:
            selectedMission.reason,
        });

      invalidateOpportunitySnapshot(
        userId
      );

      return jsonResult(result);
    } catch (
      transactionError
    ) {
      console.error(
        "Onboarding Mission Response Error:",
        transactionError
      );

      try {
        const recoveredResult =
          await getMissionOperation<OnboardingReplacementResult>(
            userId,
            operationId,
            "onboarding_replace"
          );

        if (
          recoveredResult
        ) {
          invalidateOpportunitySnapshot(
            userId
          );

          return jsonResult(
            recoveredResult
          );
        }
      } catch (
        recoveryError
      ) {
        console.error(
          "Onboarding Mission Recovery Error:",
          recoveryError
        );
      }

      return NextResponse.json(
        {
          error:
            "ASCEND temporarily lost contact with the mission service. Retry this same onboarding request safely.",

          retryable: true,

          operationId,
        },
        {
          status: 503,
        }
      );
    }
  } catch (error) {
    console.error(
      "Onboarding Route Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not complete onboarding.",
      },
      {
        status: 500,
      }
    );
  }
}
