import { supabase } from "@/lib/supabase";

export async function saveOpportunity(
  userId: string,
  opportunity: any,
  status = "saved"
) {
  return supabase
    .from("atlas_opportunity_memory")
    .upsert({
      user_id: userId,
      opportunity_id: opportunity.id,
      source: opportunity.source,
      title: opportunity.title,
      company: opportunity.company,
      status,
    });
}

export async function updateOpportunityStatus(
  userId: string,
  opportunityId: string,
  status:
    | "saved"
    | "applied"
    | "interview"
    | "accepted"
    | "rejected"
    | "ignored"
) {
  return supabase
    .from("atlas_opportunity_memory")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);
}

export async function getSavedOpportunities(
  userId: string
) {
  const { data } = await supabase
    .from("atlas_opportunity_memory")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  return data ?? [];
}