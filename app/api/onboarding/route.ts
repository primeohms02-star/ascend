import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  supabaseServer,
} from "@/lib/supabase-server";

import {
  createNewMission,
  generateMission,
} from "@/lib/atlas/brain";

import {
  saveOnboardingContext,
} from "@/lib/atlas/onboardingContext";

type OnboardingRequest = {
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

function buildFallbackMission(
  answers: ValidatedAnswers
): {
  mission: string;
  reason: string;
} {
  const firstChallenge =
    answers.challenges[0];

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

  const mission =
    missionByGoal[
      answers.goal
    ] ??
    "Choose one concrete action that moves you closer to your North Star and complete it within the next 24 hours.";

  return {
    mission,

    reason:
      `You described yourself as ${answers.identity} and selected “${answers.goal}” as your immediate goal. Your current challenge is “${firstChallenge}.” This mission creates concrete evidence of progress toward your North Star: ${answers.northStar}`,
  };
}

function parseMission(
  response: string
): {
  mission: string;
  reason: string;
} | null {
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
): string {
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

The mission must:
- Directly support the immediate goal.
- Move the user toward the North Star.
- Consider the user's current identity and experience stage.
- Address at least one stated challenge.
- Be realistically completable within one day.
- Produce visible evidence of progress.
- Avoid generic productivity or lifestyle advice.
- Avoid giving several unrelated tasks.
`;
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

    /*
    |--------------------------------------------------------------------------
    | SAVE LIVE PROFILE
    |--------------------------------------------------------------------------
    |
    | Upsert supports the rare case where the Clerk
    | webhook has not created the profile yet.
    */

    const {
      data: updatedProfile,
      error: profileError,
    } = await supabaseServer
      .from("profiles")
      .upsert(
        {
          clerk_id:
            userId,

          journey:
            answers.identity,

          north_star:
            answers.northStar,
        },
        {
          onConflict:
            "clerk_id",
        }
      )
      .select("clerk_id")
      .single();

    if (
      profileError ||
      !updatedProfile
    ) {
      console.error(
        "Onboarding Profile Save Error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Atlas could not update your profile.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE STRUCTURED ONBOARDING CONTEXT
    |--------------------------------------------------------------------------
    */

    await saveOnboardingContext(
      userId,
      {
        identity:
          answers.identity,

        goal:
          answers.goal,

        challenges:
          answers.challenges,

        northStar:
          answers.northStar,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | STORE A HUMAN-READABLE PERMANENT FACT
    |--------------------------------------------------------------------------
    |
    | Structured onboarding is authoritative.
    | This fact remains useful for conversation memory.
    */

    const onboardingFact = [
      `Identity: ${answers.identity}.`,

      `Immediate goal: ${answers.goal}.`,

      `Current challenges: ${answers.challenges.join(
        ", "
      )}.`,

      `North Star: ${answers.northStar}`,
    ].join(" ");

    const {
      data: existingFact,
      error: factLookupError,
    } = await supabaseServer
      .from("atlas_facts")
      .select("id")
      .eq("user_id", userId)
      .eq(
        "fact",
        onboardingFact
      )
      .limit(1)
      .maybeSingle();

    if (factLookupError) {
      console.error(
        "Onboarding Fact Lookup Error:",
        factLookupError
      );
    } else if (!existingFact) {
      const {
        error: factError,
      } = await supabaseServer
        .from("atlas_facts")
        .insert({
          user_id:
            userId,

          fact:
            onboardingFact,
        });

      if (factError) {
        console.error(
          "Onboarding Fact Save Error:",
          factError
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE THE FIRST TAILORED MISSION
    |--------------------------------------------------------------------------
    */

    let generatedMission:
      | {
          mission: string;
          reason: string;
        }
      | null = null;

    try {
      const missionResponse =
        await generateMission(
          null,
          answers.northStar,
          buildAtlasContext(
            answers
          )
        );

      generatedMission =
        parseMission(
          missionResponse
        );
    } catch (error) {
      console.error(
        "Atlas Onboarding Mission Generation Failed:",
        error
      );
    }

    const selectedMission =
      generatedMission ??
      buildFallbackMission(
        answers
      );

    await createNewMission(
      userId,
      selectedMission.mission,
      selectedMission.reason
    );

    /*
    |--------------------------------------------------------------------------
    | RECORD ONBOARDING MILESTONE
    |--------------------------------------------------------------------------
    */

    const {
      error: memoryError,
    } = await supabaseServer
      .from("atlas_memory")
      .insert({
        user_id:
          userId,

        role:
          "system",

        memory_type:
          "onboarding",

        title:
          "ASCEND Journey Started",

        message:
          `ASCEND onboarding completed. ${onboardingFact}`,

        metadata: {
          identity:
            answers.identity,

          goal:
            answers.goal,

          challenges:
            answers.challenges,

          north_star:
            answers.northStar,
        },
      });

    if (memoryError) {
      console.error(
        "Onboarding Memory Error:",
        memoryError
      );
    }

    return NextResponse.json({
      success: true,

      profile: {
        identity:
          answers.identity,

        goal:
          answers.goal,

        northStar:
          answers.northStar,
      },

      mission:
        selectedMission,
    });
  } catch (error) {
    console.error(
      "Onboarding Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not complete your onboarding.",
      },
      {
        status: 500,
      }
    );
  }
}