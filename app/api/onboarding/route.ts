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

type OnboardingRequest = {
  operationId?: unknown;
  identity?: unknown;
  goal?: unknown;
  challenges?: unknown;
  northStar?: unknown;
};

type ValidatedAnswers = {
  identity: string;
  goal: string;
  challenges: string[];
  northStar: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validIdentities =
  new Set([
    "Student",
    "Recent Graduate",
    "Job Seeker",
    "Early-Career Professional",
    "Experienced Professional",
    "Career Changer",
    "Freelancer",
    "Founder or Entrepreneur",
    "Creator",
    "Researcher or Academic",
    "Social Impact Professional",
    "Skilled or Technical Professional",
    "Exploring",
  ]);

const validGoals =
  new Set([
    "Find a Job",
    "Find an Internship",
    "Win a Scholarship",
    "Join a Fellowship",
    "Find Grants or Funding",
    "Build a Business",
    "Learn New Skills",
    "Change Careers",
    "Advance My Career",
    "Grow My Freelance Career",
    "Grow as a Creator",
    "Build My Network",
    "Discover My Purpose",
  ]);

function validateAnswers(
  body: OnboardingRequest
): ValidatedAnswers | null {
  if (
    typeof body.identity !==
      "string" ||
    !validIdentities.has(
      body.identity
    )
  ) {
    return null;
  }

  if (
    typeof body.goal !==
      "string" ||
    !validGoals.has(
      body.goal
    )
  ) {
    return null;
  }

  if (
    !Array.isArray(
      body.challenges
    ) ||
    body.challenges.length ===
      0 ||
    !body.challenges.every(
      (challenge) =>
        typeof challenge ===
        "string"
    )
  ) {
    return null;
  }

  if (
    typeof body.northStar !==
      "string" ||
    body.northStar.trim()
      .length < 20 ||
    body.northStar.trim()
      .length > 1200
  ) {
    return null;
  }

  const challenges =
    body.challenges
      .map((challenge) =>
        challenge.trim()
      )
      .filter(Boolean)
      .slice(0, 14);

  if (
    challenges.length === 0
  ) {
    return null;
  }

  return {
    identity:
      body.identity.trim(),

    goal:
      body.goal.trim(),

    challenges,

    northStar:
      body.northStar.trim(),
  };
}

function buildOnboardingFact(
  answers: ValidatedAnswers
) {
  return [
    `Identity: ${answers.identity}.`,

    `Immediate goal: ${answers.goal}.`,

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
    Record<string, string> = {
      "Find a Job":
        "Identify three roles that align with your North Star, choose the strongest match, and tailor the first section of your resume to its requirements.",

      "Find an Internship":
        "Find three relevant internships, compare their requirements, and prepare one tailored application for the strongest match.",

      "Win a Scholarship":
        "Identify three scholarships that match your background and North Star, then create a requirement checklist for the strongest opportunity.",

      "Join a Fellowship":
        "Find three fellowships aligned with your direction, compare their eligibility requirements, and outline your application for the strongest match.",

      "Find Grants or Funding":
        "Identify three relevant funding opportunities and write a one-paragraph explanation of the problem your project or venture will solve.",

      "Build a Business":
        "Define the specific customer problem your business will solve and speak with one potential customer to test your most important assumption.",

      "Learn New Skills":
        "Identify the three most important skills required by your North Star and complete one focused learning session on the highest-priority skill.",

      "Change Careers":
        "Choose one target role in your intended career, compare its requirements with your current experience, and identify your three most important skill gaps.",

      "Advance My Career":
        "Identify the next role or responsibility you want, document its key requirements, and choose one visible action that demonstrates your readiness.",

      "Grow My Freelance Career":
        "Define one clear freelance service, identify the client problem it solves, and create a short offer you can present to one potential client.",

      "Grow as a Creator":
        "Choose one audience problem connected to your direction and publish one useful piece of work that demonstrates your creative value.",

      "Build My Network":
        "Identify three people whose work aligns with your North Star and send one thoughtful, personalized message requesting a focused conversation.",

      "Discover My Purpose":
        "Write down three moments when you felt useful, energized or deeply engaged, then identify the common strength or impact connecting them.",
    };

  return {
    mission:
      missionByGoal[
        answers.goal
      ] ??
      "Choose one concrete action that moves you closer to your North Star and complete it within the next 24 hours.",

    reason:
      `You described yourself as ${answers.identity} and selected “${answers.goal}” as your immediate goal. Your current challenge is “${answers.challenges[0]}.” This mission creates concrete evidence of progress toward your North Star: ${answers.northStar}`,
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

  const mission =
    response.match(
      /MISSION:\s*([\s\S]*?)REASON:/i
    )?.[1]?.trim();

  const reason =
    response.match(
      /REASON:\s*([\s\S]*)/i
    )?.[1]?.trim();

  if (!mission) {
    return null;
  }

  return {
    mission,

    reason:
      reason ??
      "This mission was selected from your onboarding profile and North Star.",
  };
}

function buildAtlasContext(
  answers: ValidatedAnswers
) {
  return `
The user has explicitly completed ASCEND onboarding.

Current identity:
${answers.identity}

Immediate goal:
${answers.goal}

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
the North Star, address at least one stated challenge, be realistically
completable within one day, and produce visible evidence of progress.

Return exactly MISSION: followed by the mission and REASON: followed by why.
`;
}

function jsonResult(
  result: OnboardingReplacementResult
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
    const { userId } =
      await auth();

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
      (await request.json()) as
        OnboardingRequest;

    const answers =
      validateAnswers(
        body
      );

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

    /*
     * A repeated onboarding request returns the
     * original atomic result before AI is called.
     */
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

    const previousContext =
      await loadOnboardingContext(
        userId
      );

    /*
     * Mission generation occurs before any profile,
     * direction or mission state is modified.
     */
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
      /*
       * Profile, onboarding context, direction fact,
       * previous mission replacement, new mission and
       * timeline memory are committed together.
       */
      const result =
        await replaceMissionForOnboarding({
          userId,
          operationId,

          identity:
            answers.identity,

          goal:
            answers.goal,

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

      return jsonResult(
        result
      );
    } catch (
      transactionError
    ) {
      console.error(
        "Onboarding Mission Response Error:",
        transactionError
      );

      /*
       * Recover a transaction that committed before
       * its HTTP response was received.
       */
      try {
        const recoveredResult =
          await getMissionOperation<OnboardingReplacementResult>(
            userId,
            operationId,
            "onboarding_replace"
          );

        if (recoveredResult) {
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