import {NextRequest,NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {supabaseAdmin} from "@/lib/supabase-admin";
import {invalidateOpportunitySnapshot} from "@/lib/atlas/opportunities/service";
import {ONBOARDING_ANSWER_LIMITS,cleanOnboardingAnswer,cleanOnboardingChallenges} from "@/lib/onboardingAnswers";
import {consumeAtlasRateLimit} from "@/lib/atlas/rateLimit";
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

export async function POST(request:NextRequest){
 const {userId}=await auth();
 if(!userId)return NextResponse.json({error:"Sign in to save your direction."},{status:401});
 let body: OnboardingRequest;
 try { body=await request.json(); } catch {return NextResponse.json({error:"Invalid request."},{status:400});}
 if(!body || typeof body!=="object")return NextResponse.json({error:"Invalid request."},{status:400});
 const answers=validateAnswers(body);
 if(!answers || typeof body.operationId!=="string" || !uuidPattern.test(body.operationId))
   return NextResponse.json({error:"Some onboarding answers are missing or invalid."},{status:400});
 try{
   if(!await consumeAtlasRateLimit({userId,bucket:"atlas-direction",windowSeconds:600,maxRequests:12}))
     return NextResponse.json({error:"Wait a moment before updating your direction again."},{status:429,headers:{"Retry-After":"60"}});
   const {data,error}=await supabaseAdmin.rpc("save_atlas_direction",{
     p_user_id:userId,p_operation_id:body.operationId,p_identity:answers.identity,p_goal:answers.goal,
     p_skills:answers.skills,p_challenges:answers.challenges,p_north_star:answers.northStar,p_direction_fact:buildOnboardingFact(answers)
   });
   if(error)throw error;
   invalidateOpportunitySnapshot(userId);
   return NextResponse.json({success:true,...data,directionReady:true},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
   console.error("Direction save failed",error);
   return NextResponse.json({error:"Your direction could not be saved. Please retry.",retryable:true},{status:503});
 }
}
