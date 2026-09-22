import { NextResponse } from "next/server";
import { requireProjectsAdmin } from "@/lib/projects/admin-auth";
import { createPracticeProjectDraft, listProjectsForAdmin, transitionProject } from "@/lib/projects/admin-service";
import { projectApiError } from "@/lib/projects/api";
import type { ProjectStatus } from "@/lib/projects/types";
export async function GET(){try{await requireProjectsAdmin();return NextResponse.json(await listProjectsForAdmin());}catch(error){return projectApiError(error)}}
export async function POST(request:Request){try{const{userId}=await requireProjectsAdmin();return NextResponse.json({project:await createPracticeProjectDraft(await request.json(),userId)},{status:201});}catch(error){return projectApiError(error)}}
export async function PATCH(request:Request){try{const{userId}=await requireProjectsAdmin();const body=await request.json();return NextResponse.json({project:await transitionProject(String(body.projectId),String(body.status) as ProjectStatus,userId)});}catch(error){return projectApiError(error)}}
