import { supabaseServer } from "@/lib/supabase-server";

export async function loadCompassAnswers(
  clerkId: string
) {
  return await supabaseServer
    .from("compass_answers")
    .select("*")
    .eq("clerk_id", clerkId)
    .order("question_id", {
      ascending: true,
    });
}

export async function saveCompassAnswer(
  clerkId: string,
  questionId: string,
  answer: string
) {
  return await supabaseServer
    .from("compass_answers")
    .upsert(
      {
        clerk_id: clerkId,
        question_id: questionId,
        answer,
      },
      {
        onConflict: "clerk_id,question_id",
      }
    );
}