import { NextResponse } from "next/server";
import { ProjectServiceError } from "./errors";

export function projectApiError(error: unknown) {
  if (error instanceof ProjectServiceError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  if (error instanceof Error && error.message === "PROJECTS_ADMIN_UNAUTHENTICATED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "PROJECTS_ADMIN_FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.error("Projects API Error:", error);
  return NextResponse.json(
    { error: "ASCEND could not complete that Project request.", code: "SERVICE_FAILURE" },
    { status: 500 },
  );
}
