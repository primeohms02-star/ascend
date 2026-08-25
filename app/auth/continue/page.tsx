import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { loadOnboardingContext } from "@/lib/atlas/onboardingContext";
import { isOnboardingContextComplete } from "@/lib/atlas/onboardingCompletion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AuthContinuePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let hasCompletedOnboarding = false;

  try {
    const onboardingContext = await loadOnboardingContext(userId);
    hasCompletedOnboarding = isOnboardingContextComplete(onboardingContext);
  } catch (error) {
    console.error("Post-auth destination check failed:", error);
  }

  /*
   * redirect() throws a framework navigation signal, so it must remain
   * outside the try/catch. A failed lookup defaults to onboarding to ensure
   * a new account never reaches the dashboard without its ASCEND context.
   */
  redirect(hasCompletedOnboarding ? "/dashboard" : "/onboarding");
}
