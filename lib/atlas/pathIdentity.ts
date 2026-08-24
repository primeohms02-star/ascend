export type PathIdentity = {
  title: string;
  description: string;
  northStar: string;
};

function clean(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function buildPathIdentity(
  journeyValue: string | null | undefined,
  northStarValue: string | null | undefined
): PathIdentity {
  const journey = clean(journeyValue);
  const northStar = clean(northStarValue);
  const title =
    !journey || journey.toLowerCase() === "purpose discovery"
      ? "Purpose Explorer"
      : journey;

  return {
    title,
    description: northStar
      ? `Your path is anchored to your North Star: “${northStar}”`
      : "Your path identity will sharpen as you define and act on your North Star.",
    northStar,
  };
}
