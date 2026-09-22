export type ProjectErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_REQUEST"
  | "PROJECT_NOT_FOUND"
  | "PROJECT_UNAVAILABLE"
  | "PROJECT_NOT_STARTED"
  | "PROJECT_JOIN_CLOSED"
  | "PROJECT_SUBMISSIONS_CLOSED"
  | "PROJECT_CAPACITY_REACHED"
  | "PARTICIPATION_REQUIRED"
  | "PARTICIPATION_PENDING"
  | "PARTICIPATION_INACTIVE"
  | "SUBMISSION_LOCKED"
  | "SUBMISSION_EMPTY"
  | "SERVICE_FAILURE";

export class ProjectServiceError extends Error {
  constructor(
    public readonly code: ProjectErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ProjectServiceError";
  }
}

const databaseErrorMap: Record<string, ProjectServiceError> = {
  ASCEND_PROJECT_INVALID_USER: new ProjectServiceError("INVALID_REQUEST", "A valid user is required.", 400),
  ASCEND_PROJECT_NOT_FOUND: new ProjectServiceError("PROJECT_NOT_FOUND", "This Project could not be found.", 404),
  ASCEND_PROJECT_UNAVAILABLE: new ProjectServiceError("PROJECT_UNAVAILABLE", "This Project is not currently available.", 409),
  ASCEND_PROJECT_NOT_STARTED: new ProjectServiceError("PROJECT_NOT_STARTED", "This Project has not started yet.", 409),
  ASCEND_PROJECT_JOIN_CLOSED: new ProjectServiceError("PROJECT_JOIN_CLOSED", "Joining has closed for this Project.", 409),
  ASCEND_PROJECT_SUBMISSIONS_CLOSED: new ProjectServiceError("PROJECT_SUBMISSIONS_CLOSED", "Submissions have closed for this Project.", 409),
  ASCEND_PROJECT_CAPACITY_REACHED: new ProjectServiceError("PROJECT_CAPACITY_REACHED", "This Project has reached capacity.", 409),
  ASCEND_PROJECT_PARTICIPATION_REQUIRED: new ProjectServiceError("PARTICIPATION_REQUIRED", "Join this Project before creating a submission.", 403),
  ASCEND_PROJECT_PARTICIPATION_PENDING: new ProjectServiceError("PARTICIPATION_PENDING", "Your participation must be approved before you can begin.", 409),
  ASCEND_PROJECT_PARTICIPATION_INACTIVE: new ProjectServiceError("PARTICIPATION_INACTIVE", "This participation can no longer be updated.", 409),
  ASCEND_PROJECT_SUBMISSION_LOCKED: new ProjectServiceError("SUBMISSION_LOCKED", "This submission is locked until a revision is requested.", 409),
  ASCEND_PROJECT_SUBMISSION_EMPTY: new ProjectServiceError("SUBMISSION_EMPTY", "Add at least one deliverable before submitting.", 400),
};

export function projectErrorFromDatabase(error: unknown): ProjectServiceError {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  const match = Object.entries(databaseErrorMap).find(([code]) => message.includes(code));
  return match?.[1] ?? new ProjectServiceError("SERVICE_FAILURE", "ASCEND could not complete that Project action.", 500);
}
