import "server-only";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requirementSkillMatches } from "@/lib/projects/opportunity-projects";
async function loadRelatedProjects(userId:string, requirements:string[]) {
  if (!requirements.length) return null;
  try {
    const signal = AbortSignal.timeout(4000);
    const [projects,history,evidence] = await Promise.all([
      supabaseAdmin.from("ascend_projects").select("id,title,skills,starts_at,join_deadline").eq("project_type","practice").eq("status","published").gt("submission_deadline",new Date().toISOString()).limit(100).abortSignal(signal),
      supabaseAdmin.from("ascend_project_participations").select("project_id").eq("user_id",userId).abortSignal(signal),
      supabaseAdmin.from("ascend_project_evidence").select("id,title,skills").eq("user_id",userId).in("evidence_status",["completed","verified"]).abortSignal(signal),
    ]);
    if(projects.error||history.error||evidence.error)return null;
    const prior = new Set((history.data??[]).map(p=>p.project_id));
    const available=(projects.data??[]).filter(p=>!prior.has(p.id)&&(!p.starts_at||Date.parse(p.starts_at)<=Date.now())&&(!p.join_deadline||Date.parse(p.join_deadline)>Date.now()));
    const rank = <T extends {skills:string[]}>(rows:T[])=>rows.map(row=>({row,matches:requirementSkillMatches(requirements,row.skills)})).filter(x=>x.matches.length).sort((a,b)=>b.matches.length-a.matches.length).slice(0,2);
    const practice=rank(available), completed=rank(evidence.data??[]);
    if(!practice.length&&!completed.length)return null;
    return {practice,completed};
  }catch{return null;}
}

export default async function RelatedProjects({userId,requirements}:{userId:string;requirements:string[]}) {
  const result=await loadRelatedProjects(userId,requirements);
  if(!result)return null;
  const {practice,completed}=result;
    return <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-5"><h2 className="text-lg font-semibold text-white">Build on these requirements</h2><p className="mt-2 text-sm text-slate-400">These connections use skills named in the listing. Practice and portfolio evidence do not establish eligibility or change your match score.</p>
      {practice.map(({row,matches})=><div key={row.id} className="mt-4"><Link className="font-semibold text-cyan-200 underline" href={`/projects/${row.id}`}>{row.title}</Link><p className="mt-1 text-sm text-slate-400">Practise: {matches.join(", ")}. Review the brief before joining.</p></div>)}
      {completed.map(({row,matches})=><div key={row.id} className="mt-4"><Link className="font-semibold text-emerald-200 underline" href={`/projects/evidence#evidence-${row.id}`}>Use your work: {row.title}</Link><p className="mt-1 text-sm text-slate-400">Related skill labels: {matches.join(", ")}. Check your actual work supports the application claim; review the remaining requirements.</p></div>)}
    </section>;
}
