"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function saveCompassAnswer(
  questionId: number,
  answer: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabaseServer
    .from("compass_answers")
    .insert({
      clerk_id: userId,
      question_id: questionId,
      answer,
    });

  if (error) {
    console.error(error);
    throw new Error("Failed to save answer");
  }

  return {
    success: true,
  };
}