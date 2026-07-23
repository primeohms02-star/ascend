import { createClient } from "@supabase/supabase-js";
import { OpportunityProfile } from "./profile";



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function buildOpportunityProfile(profile: {
  clerkId: string;
}): Promise<OpportunityProfile> {

  console.log("Current Clerk ID:", profile.clerkId);

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", profile.clerkId)
    .single();

  if (!data) {
    throw new Error("Profile not found");
  }

  return {
    clerkId: data.clerk_id,

    careerGoal: data.north_star ?? "Discover my direction",

    skills: [],

    interests: [],

    experienceLevel: "beginner",

    education: "",

    location: "Remote",

    preferredCountries: [],

    remoteOnly: true,

    industries: [],

    languages: ["English"],

    salaryExpectation: undefined,
  };
}