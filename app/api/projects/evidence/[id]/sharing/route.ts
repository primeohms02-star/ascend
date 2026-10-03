import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireProjectId } from "@/lib/projects/input";
import { projectApiError } from "@/lib/projects/api";
import { projectErrorFromDatabase } from "@/lib/projects/errors";
export async function POST(request:Request,context:{params:Promise<{id:string}>}) {
  try {
    const {userId}=await auth();
    if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
    const body=await request.json();
    if(typeof body.share!=="boolean")return NextResponse.json({error:"Choose a sharing setting."},{status:400});
    const {data,error}=await supabaseAdmin.from("ascend_project_evidence")
      .update({visibility:body.share?"shareable":"private",share_token:body.share?randomUUID():null})
      .eq("id",requireProjectId((await context.params).id)).eq("user_id",userId).select("visibility,share_token").maybeSingle();
    if(error)throw projectErrorFromDatabase(error);
    if(!data)return NextResponse.json({error:"Portfolio entry not found."},{status:404});
    return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}});
  }catch(error){return projectApiError(error);}
}
