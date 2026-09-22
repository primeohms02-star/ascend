export type ProjectType = "practice" | "reward";

export type ProjectStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "paused"
  | "submissions_closed"
  | "reviewing"
  | "results_ready"
  | "completed"
  | "cancelled";

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";
export type ProjectEntryMode = "open" | "reviewed";
export type ProjectFeedbackLevel = "individual" | "scored" | "general" | "completion_only";
export type ProjectAiPolicy = "allowed" | "limited" | "restricted";
export type ProjectRightsModel = "portfolio" | "selected_use" | "licensed_use";

export type ProjectParticipationStatus =
  | "pending"
  | "joined"
  | "in_progress"
  | "submitted"
  | "revision_requested"
  | "completed"
  | "not_completed"
  | "awarded"
  | "withdrawn"
  | "disqualified";

export type ProjectSubmissionStatus =
  | "draft"
  | "submitted"
  | "revision_requested"
  | "accepted"
  | "rejected";

export type ProjectEvidenceStatus = "completed" | "verified" | "awarded";
export type ProjectEvidenceVisibility = "private" | "approved_organizations" | "shareable" | "public";
export type ProjectRewardModel = "winner" | "completion" | "non_cash";
export type ProjectFundingStatus = "draft" | "awaiting_confirmation" | "confirmed" | "secured" | "cancelled";

export type ProjectCard = {
  id: string;
  project_type: ProjectType;
  entry_mode: ProjectEntryMode;
  title: string;
  summary: string;
  category: string;
  difficulty: ProjectDifficulty;
  skills: string[];
  estimated_minutes: number;
  capacity: number | null;
  feedback_level: ProjectFeedbackLevel;
  starts_at: string | null;
  join_deadline: string | null;
  submission_deadline: string;
  results_at: string | null;
  published_at: string | null;
  sponsor_id: string | null;
};

export type ProjectParticipationSummary = {
  id: string;
  project_id: string;
  status: ProjectParticipationStatus;
  joined_at: string;
  started_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  updated_at: string;
  project: ProjectCard | null;
  submissionStatus: ProjectSubmissionStatus | null;
  evidenceStatus: ProjectEvidenceStatus | null;
};

export type ProjectRewardConfiguration = {
  projectType: ProjectType;
  rewardModel: ProjectRewardModel | null;
  recipientCount: number | null;
  amountMinor: number | null;
  currency: string | null;
  nonCashDescription: string | null;
  fundingStatus: ProjectFundingStatus | null;
};

export type ProjectPublicationReadiness = {
  title: string;
  summary: string;
  brief: string;
  deliverables: string[];
  criteriaWeights: number[];
  submissionDeadline: string;
  rightsModel: ProjectRightsModel;
  usageTerms: string;
  reward: ProjectRewardConfiguration;
};
