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