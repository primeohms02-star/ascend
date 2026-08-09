import type {
  SupportCategory,
  SupportTopic,
} from "./types";

export const supportTopics: SupportTopic[] = [
  {
    id: "sign-in-problem",
    category: "authentication",
    title: "Unable to sign in",
    description:
      "The user cannot access their ASCEND account.",
    keywords: [
      "sign in",
      "signin",
      "login",
      "log in",
      "cannot access account",
      "authentication",
      "unauthorized",
      "clerk",
    ],
    possibleCauses: [
      "The login session may have expired.",
      "The browser may be blocking authentication cookies.",
      "The account may use a different email or authentication method.",
      "The authentication service may not have finished loading.",
    ],
    recommendedSteps: [
      "Refresh the page and try signing in again.",
      "Confirm that you are using the same email or login method used during registration.",
      "Allow cookies for ASCEND in your browser.",
      "Try signing in from a private or incognito window.",
      "If the problem continues, sign out completely and begin a new session.",
    ],
  },
  {
    id: "signup-onboarding-redirect",
    category: "onboarding",
    title: "Onboarding did not open after sign-up",
    description:
      "A new user was sent somewhere other than the onboarding experience.",
    keywords: [
      "onboarding",
      "after sign up",
      "after signup",
      "sent to dashboard",
      "redirect",
      "tell us about yourself",
      "build compass",
    ],
    possibleCauses: [
      "The sign-up redirect may have used the dashboard route.",
      "The user may already have an authenticated ASCEND session.",
      "The onboarding page may not have finished loading.",
    ],
    recommendedSteps: [
      "Open the ASCEND onboarding page directly.",
      "Complete every onboarding step before opening the dashboard.",
      "If an old session is active, sign out and sign in again.",
      "Confirm that your identity, goal, challenges and North Star are saved before continuing.",
    ],
  },
  {
    id: "dashboard-not-loading",
    category: "dashboard",
    title: "Dashboard is not loading",
    description:
      "The ASCEND dashboard is slow, empty or unavailable.",
    keywords: [
      "dashboard",
      "dashboard not loading",
      "blank dashboard",
      "dashboard error",
      "slow dashboard",
      "cannot open dashboard",
    ],
    possibleCauses: [
      "The dashboard may still be loading the user profile and Atlas context.",
      "The authenticated session may have expired.",
      "A required profile or progress record may be unavailable.",
      "A network request may have timed out.",
    ],
    recommendedSteps: [
      "Refresh the dashboard once and allow it a moment to load.",
      "Confirm that you are still signed in.",
      "Check whether other ASCEND pages open successfully.",
      "Try opening the dashboard in a private browser window.",
      "If the problem continues, record the exact error message and page address.",
    ],
  },
  {
    id: "atlas-response-problem",
    category: "atlas",
    title: "Atlas is not responding correctly",
    description:
      "Atlas returned an error, outdated information or an irrelevant answer.",
    keywords: [
      "atlas",
      "atlas error",
      "atlas not responding",
      "wrong answer",
      "old mission",
      "outdated",
      "atlas encountered an error",
      "groq",
    ],
    possibleCauses: [
      "The AI provider may be temporarily unavailable.",
      "Atlas may not have received the latest live user context.",
      "The request may have timed out.",
      "The question may require additional detail.",
    ],
    recommendedSteps: [
      "Send the request again using a short and specific question.",
      "Refresh ASCEND if Atlas appears to be using outdated information.",
      "Confirm that your current North Star and profile are correct.",
      "Do not repeatedly submit the same message while Atlas is still responding.",
      "If the issue continues, save the exact response Atlas produced.",
    ],
  },
  {
    id: "mission-wrong",
    category: "missions",
    title: "Mission does not fit the user",
    description:
      "The current mission is irrelevant, repeated or poorly aligned.",
    keywords: [
      "mission",
      "wrong mission",
      "irrelevant mission",
      "mission repeated",
      "new mission",
      "daily mission",
      "does not suit me",
    ],
    possibleCauses: [
      "The onboarding answers may not describe the user accurately.",
      "The North Star may be too broad.",
      "The mission may have been generated from incomplete context.",
      "A previously completed mission may not have been recorded correctly.",
    ],
    recommendedSteps: [
      "Review your North Star and make it specific and outcome-focused.",
      "Confirm that your onboarding identity and primary goal are accurate.",
      "Complete or update the current mission only through the mission controls.",
      "Tell Atlas what makes the mission unsuitable without asking it to replace the mission automatically.",
      "If missions continue repeating, report the mission title and completion date.",
    ],
  },
  {
    id: "mission-completion-problem",
    category: "missions",
    title: "Mission completion was not recorded",
    description:
      "Completing a mission did not update momentum, progress or the timeline.",
    keywords: [
      "complete mission",
      "mission completed",
      "completion not recorded",
      "mission still showing",
      "timeline",
      "momentum",
      "streak",
    ],
    possibleCauses: [
      "The completion request may have failed.",
      "The dashboard may still be displaying cached information.",
      "The active mission record may not have been updated.",
      "The progress and mission systems may not have completed together.",
    ],
    recommendedSteps: [
      "Wait a moment and refresh the dashboard once.",
      "Check whether a new mission has replaced the completed mission.",
      "Check whether the mission appears in the Atlas Timeline.",
      "Avoid pressing Complete Mission repeatedly.",
      "If nothing changes, record the mission title and the time it was completed.",
    ],
  },
  {
    id: "ascension-progress-problem",
    category: "progress",
    title: "Ascension level or XP did not update",
    description:
      "Mission completion did not change the displayed Ascension state.",
    keywords: [
      "level",
      "xp",
      "ascension",
      "identity level",
      "progress did not update",
      "still level",
      "experience",
    ],
    possibleCauses: [
      "The dashboard may be displaying an older progress snapshot.",
      "The mission reward may not have been written successfully.",
      "The visible level may not have crossed its next XP threshold.",
      "Identity and Ascension may be reading from different records.",
    ],
    recommendedSteps: [
      "Check the current XP and the next level target shown on the dashboard.",
      "Refresh the dashboard after completing the mission.",
      "Confirm that the mission appears in the timeline.",
      "Compare the Ascension level with the Identity level.",
      "Report both displayed levels and the current XP if they remain inconsistent.",
    ],
  },
  {
    id: "opportunities-not-loading",
    category: "opportunities",
    title: "Opportunities are not loading",
    description:
      "The opportunity page is empty, slow or displaying a loading error.",
    keywords: [
      "opportunities",
      "no opportunities",
      "no matching opportunities",
      "could not load opportunities",
      "opportunity page",
      "empty opportunities",
      "slow opportunities",
    ],
    possibleCauses: [
      "One or more external opportunity sources may be unavailable.",
      "The first opportunity snapshot may still be building.",
      "The current filters may exclude available results.",
      "The authenticated session may have expired.",
      "A connector may have timed out.",
    ],
    recommendedSteps: [
      "Clear the search field and select the All filter.",
      "Wait for the first opportunity snapshot to finish loading.",
      "Refresh the page once after the snapshot has been created.",
      "Confirm that you are still signed in.",
      "If the error continues, record the message shown and the selected filter.",
    ],
  },
  {
    id: "opportunity-decision-not-found",
    category: "opportunities",
    title: "Atlas Decision page could not be found",
    description:
      "An opportunity opens a missing or unavailable Atlas Decision page.",
    keywords: [
      "atlas decision",
      "page not found",
      "404",
      "opportunity not found",
      "saved opportunity",
      "decision page",
    ],
    possibleCauses: [
      "The opportunity identifier may not have been encoded correctly.",
      "The opportunity source may be missing from the page address.",
      "The external source may no longer return the opportunity.",
      "The opportunity may not exist in the current user cache.",
    ],
    recommendedSteps: [
      "Return to the Opportunities page and open the opportunity again.",
      "Confirm that the page address contains a source parameter.",
      "Try opening the original posting to confirm that it still exists.",
      "If it came from the saved library, record the opportunity title and source.",
    ],
  },
  {
    id: "save-apply-problem",
    category: "opportunities",
    title: "Save or Apply action did not work",
    description:
      "An opportunity was not saved or its application status was not recorded.",
    keywords: [
      "save opportunity",
      "saved",
      "apply",
      "applied",
      "completed opportunity",
      "opportunity library",
      "status",
    ],
    possibleCauses: [
      "The request may have failed before the opportunity was recorded.",
      "The user may no longer be authenticated.",
      "The original posting may not contain a valid URL.",
      "The library may still be showing older data.",
    ],
    recommendedSteps: [
      "Confirm that you are signed in.",
      "Try the action once and wait for its status to change.",
      "Refresh the Opportunity Library.",
      "For applications, confirm that the original posting opened successfully.",
      "Avoid submitting the same action repeatedly while it is loading.",
    ],
  },
  {
    id: "account-profile-problem",
    category: "account",
    title: "Profile information is incorrect",
    description:
      "The user needs to correct their identity, goal or North Star.",
    keywords: [
      "profile",
      "wrong identity",
      "change north star",
      "change goal",
      "account details",
      "my information",
      "edit profile",
    ],
    possibleCauses: [
      "The onboarding answers may no longer represent the user.",
      "The profile may have been created with incomplete information.",
      "A recent update may not yet be visible.",
    ],
    recommendedSteps: [
      "Review the information currently shown in Compass.",
      "Write the exact identity, goal or North Star you want to use.",
      "Refresh the dashboard after making changes.",
      "Check that new missions reflect the updated direction.",
    ],
  },
  {
    id: "general-technical-error",
    category: "technical",
    title: "ASCEND encountered a technical problem",
    description:
      "A page crashed, displayed an unexpected error or stopped responding.",
    keywords: [
      "error",
      "failed",
      "not working",
      "crash",
      "stuck",
      "blank page",
      "something went wrong",
      "technical problem",
    ],
    possibleCauses: [
      "A network request may have failed.",
      "The browser may be using outdated cached files.",
      "An ASCEND service may be temporarily unavailable.",
      "The session may have expired.",
    ],
    recommendedSteps: [
      "Refresh the affected page once.",
      "Confirm that your internet connection is stable.",
      "Sign out and sign back in if the session appears outdated.",
      "Try the same action in a private browser window.",
      "Record the page address, action taken and exact error message.",
    ],
  },
  {
    id: "feedback-request",
    category: "feedback",
    title: "Product feedback or suggestion",
    description:
      "The user wants to propose an improvement to ASCEND.",
    keywords: [
      "feedback",
      "suggestion",
      "feature request",
      "idea",
      "improvement",
      "ascend should",
      "please add",
    ],
    possibleCauses: [
      "The user has identified an unmet need or improvement opportunity.",
    ],
    recommendedSteps: [
      "Describe the problem the proposed feature would solve.",
      "Explain where in ASCEND the feature should appear.",
      "Describe the outcome you expect after using it.",
      "Include an example when possible.",
    ],
  },
];

export function findSupportTopics(
  message: string
): SupportTopic[] {
  const normalizedMessage =
    message.toLowerCase().trim();

  if (!normalizedMessage) {
    return [];
  }

  return supportTopics
    .map((topic) => {
      const score = topic.keywords.reduce(
        (total, keyword) =>
          normalizedMessage.includes(
            keyword.toLowerCase()
          )
            ? total + 1
            : total,
        0
      );

      return {
        topic,
        score,
      };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (first, second) =>
        second.score - first.score
    )
    .map(({ topic }) => topic);
}

export function getCategoryLabel(
  category: SupportCategory
): string {
  const labels: Record<
    SupportCategory,
    string
  > = {
    account: "Account",
    authentication: "Authentication",
    onboarding: "Onboarding",
    dashboard: "Dashboard",
    atlas: "Atlas",
    missions: "Missions",
    opportunities: "Opportunities",
    progress: "Progress",
    technical: "Technical",
    billing: "Billing",
    feedback: "Feedback",
    other: "Other",
  };

  return labels[category];
}