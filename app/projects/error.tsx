"use client";
export default function ProjectsError({reset}:{reset:()=>void}) {
  return <main className="min-h-[60vh] bg-[#020617] p-10 text-white"><h1 className="text-2xl font-semibold">Projects is temporarily unavailable</h1><p className="mt-3 text-slate-400">Your saved work has not been changed. Try again in a moment.</p><button onClick={reset} className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Try again</button></main>;
}
