import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProjectCoaching } from "@/lib/projects/coaching-service";
import { requireProjectId } from "@/lib/projects/input";
import { projectApiError } from "@/lib/projects/api";
type Context = {params:Promise<{id:string}>};
async function respond(context:Context,generate:boolean) {
  try {
    const {userId}=await auth();
    if(!userId) return NextResponse.json({error:"Unauthorized"},{status:401});
    return NextResponse.json(await getProjectCoaching(requireProjectId((await context.params).id),userId,generate),{headers:{"Cache-Control":"no-store"}});
  } catch(error) {return projectApiError(error);}
}
export async function GET(_request:Request,context:Context){return respond(context,false);}
export async function POST(_request:Request,context:Context){return respond(context,true);}
