export type SupportCategory =
  | "account"
  | "authentication"
  | "onboarding"
  | "dashboard"
  | "atlas"
  | "missions"
  | "opportunities"
  | "progress"
  | "technical"
  | "billing"
  | "feedback"
  | "other";

export type SupportUrgency =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type SupportMessageRole =
  | "user"
  | "assistant";

export type SupportMessage = {
  id: string;
  role: SupportMessageRole;
  content: string;
  createdAt: string;
};

export type SupportDiagnosis = {
  category: SupportCategory;
  urgency: SupportUrgency;
  title: string;
  summary: string;
  possibleCauses: string[];
  recommendedSteps: string[];
  requiresEscalation: boolean;
};

export type SupportRequest = {
  message: string;
  conversation?: SupportMessage[];
  currentPath?: string;
  browser?: string;
};

export type SupportResponse = {
  reply: string;
  diagnosis: SupportDiagnosis;
  suggestedActions: string[];
};

export type SupportTopic = {
  id: string;
  category: SupportCategory;
  title: string;
  description: string;
  keywords: string[];
  possibleCauses: string[];
  recommendedSteps: string[];
};

export type SupportCaseStatus =
  | "open"
  | "investigating"
  | "waiting_for_user"
  | "resolved"
  | "closed";

export type SupportEvidence = {
  id: string;
  type:
    | "error_message"
    | "page"
    | "browser"
    | "screenshot"
    | "note";
  label: string;
  value: string;
  createdAt: string;
};

export type SupportCase = {
  id: string;
  referenceNumber: string;
  userId?: string | null;
  contactEmail?: string | null;
  category: SupportCategory;
  urgency: SupportUrgency;
  status: SupportCaseStatus;
  title: string;
  initialMessage: string;
  diagnosis: SupportDiagnosis;
  conversation: SupportMessage[];
  suggestedActions: string[];
  evidence: SupportEvidence[];
  currentPath?: string | null;
  browser?: string | null;
  resolution?: string | null;
  assignedTo?: string | null;
  escalatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupportCaseRequest = {
  initialMessage: string;
  diagnosis: SupportDiagnosis;
  conversation: SupportMessage[];
  suggestedActions: string[];
  evidence?: SupportEvidence[];
  currentPath?: string;
  browser?: string;
  contactEmail?: string;
};

export type CreateSupportCaseResponse = {
  success: true;
  duplicate: boolean;
  supportCase: SupportCase;
};

export type SupportCaseErrorResponse = {
  success: false;
  error: string;
};