import { NextResponse } from "next/server";
import { requireProjectsAdmin } from "@/lib/projects/admin-auth";
import { reviewProjectSubmission } from "@/lib/projects/admin-service";
import { projectApiError } from "@/lib/projects/api";
export async function POST(request:Request){try{const{userId}=await requireProjectsAdmin();const body=await request.json();return NextResponse.json({review:await reviewProjectSubmission(String(body.submissionId),body,userId)});}catch(error){return projectApiError(error)}}
