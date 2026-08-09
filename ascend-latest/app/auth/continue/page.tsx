import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { loadOnboardingContext } from "@/lib/atlas/onboardingContext";

export default async function AuthContinuePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const onboardingContext = await loadOnboardingContext(userId);

    redirect(onboardingContext ? "/dashboard" : "/onboarding");
  } catch (error) {
    console.error("Post-auth destination check failed:", error);

    /*
     * Authentication has already succeeded. If the onboarding lookup is
     * temporarily unavailable, keep the account usable instead of trapping
     * the user in the authentication flow.
     */
    redirect("/dashboard");
  }
}
