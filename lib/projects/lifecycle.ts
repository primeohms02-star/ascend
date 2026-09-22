import type {
  ProjectParticipationStatus,
  ProjectPublicationReadiness,
  ProjectRewardConfiguration,
  ProjectStatus,
} from "./types";

const projectTransitions: Record<ProjectStatus, readonly ProjectStatus[]> = {
  draft: ["review", "cancelled"],
  review: ["draft", "scheduled", "published", "cancelled"],
  scheduled: ["published", "draft", "cancelled"],
  published: ["paused", "submissions_closed", "cancelled"],
  paused: ["published", "submissions_closed", "cancelled"],
  submissions_closed: ["reviewing", "cancelled"],
  reviewing: ["results_ready", "cancelled"],
  results_ready: ["completed", "reviewing", "cancelled"],
  completed: [],
  cancelled: [],
};

const participationTransitions: Record<ProjectParticipationStatus, readonly ProjectParticipationStatus[]> = {
  pending: ["joined", "withdrawn", "disqualified"],
  joined: ["in_progress", "submitted", "withdrawn", "disqualified"],
  in_progress: ["submitted", "withdrawn", "disqualified"],
  submitted: ["revision_requested", "completed", "not_completed", "awarded", "disqualified"],
  revision_requested: ["submitted", "withdrawn", "not_completed", "disqualified"],
  completed: ["awarded"],
  not_completed: [],
  awarded: [],
  withdrawn: [],
  disqualified: [],
};

export function canTransitionProjectStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  return projectTransitions[from].includes(to);
}

export function canTransitionProjectParticipation(
  from: ProjectParticipationStatus,
  to: ProjectParticipationStatus,
): boolean {
  return participationTransitions[from].includes(to);
}

export function validateProjectReward(reward: ProjectRewardConfiguration): string[] {
  if (reward.projectType === "practice") {
    return reward.rewardModel === null && reward.amountMinor === null && reward.currency === null
      ? []
      : ["Practice Projects cannot contain a financial or competitive reward configuration."];
  }

  const errors: string[] = [];
  if (!reward.rewardModel) errors.push("Reward Projects require a reward model.");
  if (!reward.fundingStatus || !["confirmed", "secured"].includes(reward.fundingStatus)) {
    errors.push("Reward funding must be confirmed or secured before publication.");
  }
  if (!reward.recipientCount || reward.recipientCount < 1) {
    errors.push("Reward Projects require at least one recipient.");
  }

  if (reward.rewardModel === "winner" || reward.rewardModel === "completion") {
    if (!reward.amountMinor || reward.amountMinor < 1) errors.push("Financial rewards require a positive amount.");
    if (!reward.currency || !/^[A-Z]{3}$/.test(reward.currency)) errors.push("Financial rewards require a valid currency code.");
  }

  if (reward.rewardModel === "non_cash" && !reward.nonCashDescription?.trim()) {
    errors.push("Non-cash rewards require a clear description.");
  }

  return errors;
}

export function validateProjectPublication(input: ProjectPublicationReadiness, now = new Date()): string[] {
  const errors: string[] = [];
  if (input.title.trim().length < 4) errors.push("Add a clear Project title.");
  if (input.summary.trim().length < 20) errors.push("Add a useful Project summary.");
  if (input.brief.trim().length < 40) errors.push("Add a complete Project brief.");
  if (!input.deliverables.length || input.deliverables.some((item) => item.trim().length < 3)) {
    errors.push("Add at least one clear deliverable.");
  }
  if (!input.criteriaWeights.length || input.criteriaWeights.some((weight) => weight <= 0)) {
    errors.push("Add positive evaluation criteria weights.");
  } else if (input.criteriaWeights.reduce((total, weight) => total + weight, 0) !== 100) {
    errors.push("Evaluation criteria weights must total 100.");
  }
  const deadline = new Date(input.submissionDeadline);
  if (Number.isNaN(deadline.getTime()) || deadline <= now) errors.push("Set a future submission deadline.");
  if (!input.usageTerms.trim()) errors.push("Add submission usage terms.");
  errors.push(...validateProjectReward(input.reward));
  return errors;
}
