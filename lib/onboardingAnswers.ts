export const ONBOARDING_ANSWER_LIMITS = {
  identity: 120,
  goal: 180,
  challenge: 240,
  challenges: 15,
} as const;

function normalizeAnswer(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

export function cleanOnboardingAnswer(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const answer =
    normalizeAnswer(value);

  if (
    answer.length < 2 ||
    answer.length > maxLength
  ) {
    return null;
  }

  return answer;
}

export function cleanOnboardingChallenges(
  value: unknown
): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length >
      ONBOARDING_ANSWER_LIMITS.challenges ||
    !value.every(
      (challenge) =>
        typeof challenge === "string"
    )
  ) {
    return null;
  }

  const uniqueChallenges =
    new Map<string, string>();

  for (const challengeValue of value) {
    const challenge =
      normalizeAnswer(
        challengeValue as string
      );

    if (
      challenge.length < 2 ||
      challenge.length >
        ONBOARDING_ANSWER_LIMITS.challenge
    ) {
      return null;
    }

    const challengeKey =
      challenge.toLowerCase();

    if (
      !uniqueChallenges.has(
        challengeKey
      )
    ) {
      uniqueChallenges.set(
        challengeKey,
        challenge
      );
    }
  }

  const challenges = Array.from(
    uniqueChallenges.values()
  );

  return challenges.length > 0
    ? challenges
    : null;
}
