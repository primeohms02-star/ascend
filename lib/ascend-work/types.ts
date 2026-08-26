export type WorkAccessSource =
  | "individual"
  | "university"
  | "corporate"
  | "foundation"
  | "pilot"
  | "admin";

export type WorkAccess = {
  active: boolean;
  source: WorkAccessSource | null;
  sponsorName: string | null;
  endsAt: string | null;
};

export type PaidMission = {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  requiredSkills: string[];
  deliverables: string[];
  paymentAmountMinor: number;
  currency: string;
  estimatedHours: number;
  availableSlots: number;
  applicationDeadline: string;
  deliveryDeadline: string;
  publishedAt: string;
};

export type WorkApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed"
  | "disputed";

export type WorkOrganizationAdmin = {
  id: string;
  name: string;
  website: string | null;
  verificationStatus: "pending" | "verified" | "rejected" | "suspended";
};

export type PaidMissionAdmin = Omit<PaidMission, "publishedAt"> & {
  status: "draft" | "review" | "published" | "paused" | "closed" | "completed" | "cancelled";
  organizationVerificationStatus: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
