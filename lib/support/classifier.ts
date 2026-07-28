import {
  findSupportTopics,
  getCategoryLabel,
} from "./knowledge";

import type {
  SupportCategory,
  SupportDiagnosis,
  SupportTopic,
  SupportUrgency,
} from "./types";

const criticalSignals = [
  "account hacked",
  "security breach",
  "stolen account",
  "unauthorized access",
  "personal data exposed",
  "charged without permission",
  "cannot access my account",
];

const highUrgencySignals = [
  "urgent",
  "completely broken",
  "nothing works",
  "cannot sign in",
  "can't sign in",
  "lost all progress",
  "payment problem",
  "charged twice",
  "data missing",
  "account locked",
  "production down",
];

const lowUrgencySignals = [
  "suggestion",
  "feedback",
  "feature request",
  "idea",
  "could you add",
  "would be nice",
  "minor issue",
];

function containsAny(
  message: string,
  signals: string[]
): boolean {
  const normalizedMessage =
    message.toLowerCase();

  return signals.some((signal) =>
    normalizedMessage.includes(
      signal.toLowerCase()
    )
  );
}

export function detectUrgency(
  message: string
): SupportUrgency {
  if (
    containsAny(
      message,
      criticalSignals
    )
  ) {
    return "critical";
  }

  if (
    containsAny(
      message,
      highUrgencySignals
    )
  ) {
    return "high";
  }

  if (
    containsAny(
      message,
      lowUrgencySignals
    )
  ) {
    return "low";
  }

  return "normal";
}

function createFallbackTopic(
  message: string
): SupportTopic {
  const normalized =
    message.toLowerCase();

  let category: SupportCategory =
    "other";

  if (
    normalized.includes("account") ||
    normalized.includes("profile")
  ) {
    category = "account";
  } else if (
    normalized.includes("sign in") ||
    normalized.includes("login") ||
    normalized.includes("sign up")
  ) {
    category = "authentication";
  } else if (
    normalized.includes("atlas")
  ) {
    category = "atlas";
  } else if (
    normalized.includes("mission")
  ) {
    category = "missions";
  } else if (
    normalized.includes("opportunit")
  ) {
    category = "opportunities";
  } else if (
    normalized.includes("dashboard")
  ) {
    category = "dashboard";
  } else if (
    normalized.includes("level") ||
    normalized.includes("progress") ||
    normalized.includes("xp") ||
    normalized.includes("ascension")
  ) {
    category = "progress";
  } else if (
    normalized.includes("error") ||
    normalized.includes("failed") ||
    normalized.includes(
      "not working"
    )
  ) {
    category = "technical";
  } else if (
    normalized.includes("feedback") ||
    normalized.includes("suggestion") ||
    normalized.includes("idea")
  ) {
    category = "feedback";
  }

  return {
    id: "unclassified-support-request",
    category,
    title: `${getCategoryLabel(
      category
    )} support request`,
    description:
      "The issue needs additional information before ASCEND Support can provide a precise diagnosis.",
    keywords: [],
    possibleCauses: [
      "The available description may not contain enough detail.",
      "The issue may involve more than one ASCEND system.",
      "The problem may require the exact error message or page address.",
    ],
    recommendedSteps: [
      "Describe what you were trying to do.",
      "Describe what happened instead.",
      "Include the exact error message if one appeared.",
      "Include the ASCEND page where the issue occurred.",
      "Mention whether the issue happens every time or only sometimes.",
    ],
  };
}

function shouldEscalate(
  urgency: SupportUrgency,
  topic: SupportTopic,
  message: string
): boolean {
  if (
    urgency === "critical" ||
    urgency === "high"
  ) {
    return true;
  }

  const escalationSignals = [
    "still not working",
    "tried everything",
    "keeps happening",
    "happened again",
    "same problem",
    "cannot resolve",
    "need human support",
    "contact support",
  ];

  if (
    containsAny(
      message,
      escalationSignals
    )
  ) {
    return true;
  }

  return [
    "billing",
    "account",
  ].includes(topic.category);
}

export function classifySupportRequest(
  message: string
): SupportDiagnosis {
  const matchingTopics =
    findSupportTopics(message);

  const primaryTopic =
    matchingTopics[0] ??
    createFallbackTopic(message);

  const urgency =
    detectUrgency(message);

  return {
    category:
      primaryTopic.category,

    urgency,

    title:
      primaryTopic.title,

    summary:
      primaryTopic.description,

    possibleCauses:
      primaryTopic.possibleCauses,

    recommendedSteps:
      primaryTopic.recommendedSteps,

    requiresEscalation:
      shouldEscalate(
        urgency,
        primaryTopic,
        message
      ),
  };
}

export function getSupportContext(
  message: string
): string {
  const diagnosis =
    classifySupportRequest(message);

  const matchingTopics =
    findSupportTopics(message).slice(0, 3);

  const topicContext =
    matchingTopics.length > 0
      ? matchingTopics
          .map(
            (topic, index) => `
MATCHED SUPPORT TOPIC ${index + 1}

Title:
${topic.title}

Category:
${getCategoryLabel(topic.category)}

Description:
${topic.description}

Known possible causes:
${topic.possibleCauses
  .map((cause) => `- ${cause}`)
  .join("\n")}

Recommended troubleshooting:
${topic.recommendedSteps
  .map((step) => `- ${step}`)
  .join("\n")}
`
          )
          .join("\n")
      : "No exact support topic matched. Ask focused diagnostic questions before proposing a technical conclusion.";

  return `
SUPPORT CLASSIFICATION

Category:
${getCategoryLabel(
  diagnosis.category
)}

Urgency:
${diagnosis.urgency}

Diagnosis:
${diagnosis.title}

Escalation currently recommended:
${
  diagnosis.requiresEscalation
    ? "Yes"
    : "No"
}

${topicContext}
`.trim();
}