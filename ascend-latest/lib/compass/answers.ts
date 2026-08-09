import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function loadCompassAnswers(
  clerkId: string
) {
  const { data, error } =
    await supabaseServer
      .from("compass_answers")
      .select("*")
      .eq(
        "clerk_id",
        clerkId
      )
      .order("question_id", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Compass Answers Load Error:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function saveCompassAnswer(
  clerkId: string,
  questionId: number,
  answer: string
) {
  const cleanAnswer =
    answer.trim();

  if (!cleanAnswer) {
    throw new Error(
      "A Compass answer is required."
    );
  }

  const { data, error } =
    await supabaseServer
      .from("compass_answers")
      .upsert(
        {
          clerk_id:
            clerkId,
          question_id:
            Number(
              questionId
            ),
          answer:
            cleanAnswer,
        },
        {
          onConflict:
            "clerk_id,question_id",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "Compass Answer Save Error:",
      error
    );

    throw error;
  }

  return data;
}