import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isProjectsAdmin } from "@/lib/projects/admin-auth";
export async function GET(){const{userId}=await auth();return NextResponse.json({isAdmin:isProjectsAdmin(userId)});}
