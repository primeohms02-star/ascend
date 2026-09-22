import { NextResponse } from "next/server";
import { ProjectServiceError } from "./errors";

export function projectApiError(error: unknown) {
  if (error instanceof ProjectServiceError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  console.error("Projects API Error:", error);
  return NextResponse.json(
    { error: "ASCEND could not complete that Project request.", code: "SERVICE_FAILURE" },
    { status: 500 },
  );
}
