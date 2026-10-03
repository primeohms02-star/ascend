import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireProjectId } from "@/lib/projects/input";
import { projectApiError } from "@/lib/projects/api";
import { projectErrorFromDatabase } from "@/lib/projects/errors";
export async function POST(_request:Request,context:{params:Promise<{id:string}>}) {
  try {
    const {userId}=await auth();
    if(!userId) return NextResponse.json({error:"Unauthorized"},{status:401});
    const {data,error}=await supabaseAdmin.rpc("ascend_complete_learning_project",{p_project_id:requireProjectId((await context.params).id),p_user_id:userId});
    if(error) throw projectErrorFromDatabase(error);
    return NextResponse.json({evidenceId:data});
  } catch(error){return projectApiError(error);}
}
