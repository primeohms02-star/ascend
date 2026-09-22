import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/app/components/navigation/AppShell";
import SubmissionWorkspace from "./SubmissionWorkspace";

export default async function ProjectWorkspacePage({params}:{params:Promise<{id:string}>}){const{userId}=await auth();if(!userId)redirect("/sign-in");const{id}=await params;return <AppShell><main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]"><div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-9"><Link href="/projects/my" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/>My Projects</Link><p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Project workspace</p><h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Build and submit your work</h1><p className="mt-2 mb-6 text-sm text-slate-400">Your draft is private until you submit it for review.</p><SubmissionWorkspace projectId={id}/></div></main></AppShell>}
