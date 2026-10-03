import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, FolderKanban, Search, ShieldCheck, Sparkles } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { isProjectsAdmin } from "@/lib/projects/admin-auth";
import { listPublishedProjects, projectsForDirection } from "@/lib/projects/service";
import type { ProjectDifficulty } from "@/lib/projects/types";
import ProjectCard from "./ProjectCard";

type SearchParams = Promise<{ page?: string; experience?: string; difficulty?: string; category?: string; search?: string }>;

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const params = await searchParams;
  const showAdminConsole = isProjectsAdmin(userId);
  const suggestions = await projectsForDirection(userId);
  const requestedPage = Number(params.page);
  const page = Number.isInteger(requestedPage) && requestedPage>0 ? Math.min(requestedPage,10000) : 1;
  const result = await listPublishedProjects({
    page,
    pageSize: 12,
    experienceKind: params.experience === "explore" || params.experience === "build" ? params.experience : undefined,
    difficulty: ["beginner", "intermediate", "advanced"].includes(params.difficulty ?? "") ? params.difficulty as ProjectDifficulty : undefined,
    category: params.category?.trim() || undefined,
    search: params.search?.trim().slice(0, 100) || undefined,
  });

  return <AppShell><main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
    <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-9">
      <header className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Projects</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Turn your interests into work you can show</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Complete practical work, strengthen your skills and turn finished Projects into evidence of what you can do.</p></div>
        <div className="flex flex-wrap gap-2">{showAdminConsole&&<Link href="/projects/admin" className="rounded-xl border border-violet-300/20 bg-violet-300/[0.07] px-4 py-2.5 text-sm font-semibold text-violet-200">Admin Console</Link>}<Link href="/projects/my" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white">My Projects</Link><Link href="/projects/evidence" className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950">My Portfolio</Link></div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[{icon:Sparkles,title:"Practice with purpose",text:"Explore a pathway or build a portfolio piece, one milestone at a time."},{icon:ShieldCheck,title:"Fair and transparent",text:"Know what to build, how it is reviewed and what stays yours."},{icon:FolderKanban,title:"Keep your proof",text:"Get Atlas coaching, reflect on your choices and keep your work."}].map((item)=>{const Icon=item.icon;return <div key={item.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><Icon size={18} className="text-cyan-300"/><p className="mt-3 text-sm font-semibold text-white">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p></div>})}
      </section>

      {suggestions.length>0&&<section className="mt-6"><h2 className="font-semibold text-white">Connected to your North Star</h2><p className="mt-1 text-xs text-slate-400">Based on shared topics in your saved direction, not a readiness assessment.</p><div className="mt-3 grid gap-3 md:grid-cols-3">{suggestions.map(({project,matches})=><Link key={project.id} href={`/projects/${project.id}`} className="rounded-xl border border-violet-300/20 bg-violet-300/5 p-4"><p className="text-sm font-semibold text-white">{project.title}</p><p className="mt-2 text-xs text-violet-200">Shared topic: {matches.join(", ")}</p></Link>)}</div></section>}
      <form className="mt-6 grid gap-2 rounded-2xl border border-white/[0.08] bg-black/10 p-3 sm:grid-cols-[1fr_repeat(2,auto)_auto]">
        <label className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-500"/><span className="sr-only">Search Projects</span><input name="search" defaultValue={params.search} placeholder="Search Projects" className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400/40"/></label>
        <select aria-label="Experience" name="experience" defaultValue={params.experience??""} className="h-10 rounded-xl border border-white/10 bg-[#0a1320] px-3 text-sm text-slate-300"><option value="">Explore and Build</option><option value="explore">Explore a pathway</option><option value="build">Build a portfolio piece</option></select>
        <select aria-label="Difficulty" name="difficulty" defaultValue={params.difficulty ?? ""} className="h-10 rounded-xl border border-white/10 bg-[#0a1320] px-3 text-sm text-slate-300"><option value="">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
        <button className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950">Filter</button>
      </form>

      <div className="mt-6 flex items-center justify-between"><p className="text-sm text-slate-400"><span className="font-semibold text-white">{result.pagination.total}</span> open Project{result.pagination.total === 1 ? "" : "s"}</p><p className="text-xs text-slate-500">Page {result.pagination.page} of {Math.max(1,result.pagination.totalPages)}</p></div>
      {result.projects.length ? <section className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{result.projects.map((project)=><ProjectCard key={project.id} project={project as never}/>)}</section> : <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-10 text-center"><p className="font-semibold text-white">No matching Projects yet</p><p className="mt-2 text-sm text-slate-500">Try broader filters or return soon as new briefs are added.</p></div>}
      <div className="mt-6 flex justify-end gap-2">{result.pagination.hasPreviousPage&&<Link href={{pathname:"/projects",query:{...params,page:page-1}}} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Previous</Link>}{result.pagination.hasNextPage&&<Link href={{pathname:"/projects",query:{...params,page:page+1}}} className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Next <ArrowRight size={15}/></Link>}</div>
    </div>
  </main></AppShell>;
}
