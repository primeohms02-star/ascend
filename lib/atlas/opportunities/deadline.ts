export type OpportunityDeadlineStatus =
  | "none"
  | "invalid"
  | "expired"
  | "urgent"
  | "soon"
  | "open";

export type OpportunityDeadlineAnalysis = {
  status: OpportunityDeadlineStatus;
  daysRemaining?: number;
  timestamp?: number;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function analyzeOpportunityDeadline(
  deadline?: string,
  now = new Date(),
): OpportunityDeadlineAnalysis {
  const cleanDeadline = deadline?.trim();

  if (!cleanDeadline) {
    return { status: "none" };
  }

  const parsedDeadline = DATE_ONLY_PATTERN.test(cleanDeadline)
    ? new Date(`${cleanDeadline}T23:59:59.999Z`)
    : new Date(cleanDeadline);

  if (Number.isNaN(parsedDeadline.getTime())) {
    return { status: "invalid" };
  }

  const millisecondsRemaining = parsedDeadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(
    millisecondsRemaining / (1000 * 60 * 60 * 24),
  );
  const timestamp = parsedDeadline.getTime();

  if (millisecondsRemaining < 0) {
    return { status: "expired", daysRemaining, timestamp };
  }

  if (daysRemaining <= 7) {
    return { status: "urgent", daysRemaining, timestamp };
  }

  if (daysRemaining <= 30) {
    return { status: "soon", daysRemaining, timestamp };
  }

  return { status: "open", daysRemaining, timestamp };
}

export function isOpportunityExpired(
  deadline?: string,
  now = new Date(),
): boolean {
  return analyzeOpportunityDeadline(deadline, now).status === "expired";
}
