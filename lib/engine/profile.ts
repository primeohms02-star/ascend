import { supabaseServer } from "@/lib/supabase-server";

export type UserProfile = {
  clerkId: string;
  answers: {
    questionId: number;
    answer: string;
  }[];
};

export async function getUserProfile(
  clerkId: string
): Promise<UserProfile> {
  const { data, error } = await supabaseServer
    .from("compass_answers")
    .select("question_id, answer")
    .eq("clerk_id", clerkId)
    .order("question_id", { ascending: true });

  if (error) {
    throw error;
  }

  return {
    clerkId,
    answers:
      data?.map((item) => ({
        questionId: item.question_id,
        answer: item.answer,
      })) ?? [],
  };
}