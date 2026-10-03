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
  submitted: ["revision_requested", "completed", "not_completed", "disqualified"],
  revision_requested: ["submitted", "withdrawn", "not_completed", "disqualified"],
  completed: [],
  not_completed: [],
  awarded: [],
  withdrawn: [],
  disqualified: [],
};

export function canTransitionProjectStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  return projectTransitions[from]?.includes(to) ?? false;
}

export function canTransitionProjectParticipation(
  from: ProjectParticipationStatus,
  to: ProjectParticipationStatus,
): boolean {
  return participationTransitions[from]?.includes(to) ?? false;
}

export function validateProjectReward(reward: ProjectRewardConfiguration): string[] {
  if (reward.projectType === "practice") {
    return reward.rewardModel === null && reward.amountMinor === null && reward.currency === null && reward.recipientCount === null && reward.nonCashDescription === null && reward.fundingStatus === null
      ? []
      : ["Practice Projects cannot contain a financial or competitive reward configuration."];
  }

  return ["Reward Projects are retired. Create an Explore or Build Project."];
}

export function validateProjectPublication(input: ProjectPublicationReadiness, now = new Date()): string[] {
  const errors: string[] = [];
  if (input.title.trim().length < 4) errors.push("Add a clear Project title.");
  if (input.summary.trim().length < 20) errors.push("Add a useful Project summary.");
  if (input.brief.trim().length < 40) errors.push("Add a complete Project brief.");
  if (!input.deliverables.length || input.deliverables.some((item) => item.trim().length < 3 || item.trim().length > 120)) {
    errors.push("Add clear deliverables of 3–120 characters.");
  }
  if (new Set(input.deliverables).size !== input.deliverables.length) errors.push("Use unique milestone titles.");
  if (!input.criteriaWeights.length || input.criteriaWeights.some((weight) => weight <= 0)) {
    errors.push("Add positive evaluation criteria weights.");
  } else if (input.criteriaWeights.reduce((total, weight) => total + weight, 0) !== 100) {
    errors.push("Evaluation criteria weights must total 100.");
  }
  const deadline = new Date(input.submissionDeadline);
  if (Number.isNaN(deadline.getTime()) || deadline <= now) errors.push("Set a future submission deadline.");
  if (input.rightsModel !== "portfolio") errors.push("Learning Projects must preserve participant portfolio rights.");
  if (!input.usageTerms.trim()) errors.push("Add submission usage terms.");
  errors.push(...validateProjectReward(input.reward));
  return errors;
}
