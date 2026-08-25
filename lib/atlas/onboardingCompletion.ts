export type OnboardingCompletionCandidate = {
  identity?: string | null;
  goal?: string | null;
  north_star?: string | null;
};

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isOnboardingContextComplete(
  context: OnboardingCompletionCandidate | null | undefined,
): boolean {
  return Boolean(
    context &&
      hasText(context.identity) &&
      hasText(context.goal) &&
      hasText(context.north_star),
  );
}
