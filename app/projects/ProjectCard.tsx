import Link from "next/link";
import { ArrowRight, Clock3, Layers3 } from "lucide-react";

import { formatProjectDate, formatProjectDuration, projectDifficultyLabel } from "@/lib/projects/presentation";
import type { ProjectCard as ProjectCardType } from "@/lib/projects/types";

export default function ProjectCard({ project }: { project: ProjectCardType }) {

  return (
    <Link href={`/projects/${project.id}`} className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.045]">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-cyan-300/20 px-2.5 py-1 text-xs text-cyan-200">{project.experience_kind === "explore" ? "Explore" : "Build"}</span>
        <Layers3 size={17} className="text-cyan-300" aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{project.category} · {projectDifficultyLabel(project.difficulty)}</p>
      <h2 className="mt-1.5 text-lg font-semibold leading-7 text-white">{project.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">{skill}</span>)}
      </div>
      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        <div className="text-xs leading-5 text-slate-500">
          <span className="flex items-center gap-1.5"><Clock3 size={13} aria-hidden="true" />{formatProjectDuration(project.estimated_minutes)}</span>
          <span>Due {formatProjectDate(project.submission_deadline)}</span>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-cyan-300">View <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
