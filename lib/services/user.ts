import { auth } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

import { getUserProfile } from "@/lib/engine/profile";
import { buildBrainContext } from "@/lib/brain/context";

export async function getCurrentUserBrain() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await getUserProfile(userId);

  const firstAnswer =
    profile.answers.find(
      (answer) => answer.questionId === 1
    )?.answer ?? "I'm Not Sure Yet";

  return buildBrainContext(firstAnswer);
}