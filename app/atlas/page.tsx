"use client";
import { getSkillGrowth } from "@/lib/atlas/skillGrowth";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import AtlasBackground from "./components/AtlasBackground";
import NorthStar from "./components/NorthStar";
import Milestone from "./components/Milestone";
import { useRouter } from "next/navigation";

export default function AtlasPage() {
  const { user } = useUser();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [message, setMessage] = useState("");
const [reply, setReply] = useState("Loading...");

const [insight, setInsight] = useState(
  "Analyzing your journey..."
);

async function sendMessage() {
  if (!message.trim()) return;

  const res = await fetch("/api/atlas/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      clerkId: user?.id,
    }),
  });

  const data = await res.json();

  setReply(data.reply);
  setMessage("");
}

useEffect(() => {
  if (user?.id) {
    loadInsight();
  }
}, [user]);

useEffect(() => {
  if (!user?.id) return;

  async function loadDashboard() {
    const res = await fetch("/api/dashboard");

    if (!res.ok) return;

    const data = await res.json();

    setDashboard(data);

const briefing = await fetch("/api/atlas/briefing");
const briefingData = await briefing.json();

setReply(briefingData.greeting);

  }

  loadDashboard();
}, [user]);

async function loadInsight() {
  if (!user?.id) return;

 

  const res = await fetch("/api/atlas/insight", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkId: user.id,
    }),
  });

  const data = await res.json();

  setInsight(data.insight);
}

if (!dashboard) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020611] text-white">
      Loading Atlas...
    </main>
  );
}

const orbPositions: Record<number, number> = {
  1: 540,
  2: 470,
  3: 390,
  4: 310,
  5: 230,
  6: 150,
};

const orbTop =
  orbPositions[
    Math.min(
      dashboard.atlasProgress.level,
      6
    )
  ] ?? 540;

const skills = getSkillGrowth(
  dashboard?.profile?.journey ?? "Explorer"
);

return (
  
<main className="relative min-h-screen overflow-hidden bg-[#020611] text-white">

{/* Back Button */}
<div className="absolute top-4 left-6 z-50">
  <button
    onClick={() => router.back()}
    className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-slate-900/70 px-4 py-2 text-sm font-medium text-cyan-300 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-200"
  >
    ← Back
  </button>
</div>

<AtlasBackground />  

  <div className="relative flex min-h-screen items-center justify-center">  

    {/* ATLAS PANEL */}

<div className="absolute left-4 top-15 w-[360px]">    <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(34,211,238,0.08)]">  {/* Header */}  
<div className="border-b border-slate-700/50 px-6 py-5">  

  <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">  
    Atlas  
  </p>  

  <h2 className="mt-2 text-2xl font-bold">  
    Your Personal Strategist  
  </h2>  

</div>  

{/* Conversation */}  
<div className="space-y-5 px-6 py-6 h-[360px] overflow-y-auto">  

  <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">  

    <p className="text-sm text-cyan-300 font-semibold">  
      ATLAS  
    </p>  

   <p className="mt-2 whitespace-pre-line leading-7 text-slate-300">
  {reply}
</p>
  </div>  

</div>  

{/* Input */}  
<div className="border-t border-slate-700/50 p-5">  

  <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">  

    <input
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Ask Atlas anything..."
  className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-500"
/>

    <button 
      onClick={sendMessage}
      className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
    >  
      Send  
    </button>  

  </div>  

</div>

  </div>  {/* INTELLIGENCE PANEL */}

<div className="absolute left-[257%] top-2 w-[270px] space-y-5">  {/* Identity */}

  <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-[0_0_35px_rgba(34,211,238,0.08)]">  <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">  
  Identity  
</p>  

<h3 className="mt-3 text-2xl font-bold">
  {dashboard.identity.title}
</h3>

<p className="mt-3 text-slate-400">  
  Confidence  
</p>  

<div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">  
  <div className="h-full w-[78%] rounded-full bg-cyan-400" />  
</div>  

<p className="mt-2 text-cyan-300 font-semibold">
  Level {dashboard.identity.level}
</p>

  </div>  {/* Opportunity */}

  <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-[0_0_35px_rgba(34,211,238,0.08)]">  <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">  
  Opportunity  
</p>  

<h3 className="mt-3 text-xl font-semibold">
  {dashboard.opportunities?.[0]?.title ?? "No Opportunity Yet"}
</h3>
<p className="mt-3 text-slate-400">  
  Deadline  
</p>  

<p className="mt-1 text-cyan-300 font-semibold">
  {dashboard.opportunities?.[0]?.description ??
    "Atlas is preparing opportunities for you."}
</p>

  </div>  {/* Next Level */}

  <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-[0_0_35px_rgba(34,211,238,0.08)]">  <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">  
  Next Level  
</p>  

<h3 className="mt-3 text-xl font-semibold">
  Level {dashboard.atlasProgress.level + 1}
</h3>

<p className="mt-3 text-slate-400">  
  Progress  
</p>  

<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
  <div
    className="h-full rounded-full bg-cyan-400 transition-all duration-700"
    style={{
      width: `${Math.min(
        dashboard.atlasProgress.ascension_score % 100,
        100
      )}%`,
    }}
  />
</div>

<p className="mt-2 text-cyan-300 font-semibold">
  {dashboard.atlasProgress.ascension_score} XP
</p>

  </div>  </div>  </div>  {/* Heading */}  
    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">  
      <h1 className="text-3xl font-bold">  
        Your North Star  
      </h1>  

     <p className="mt-2 text-lg text-slate-400">
  {dashboard.compass.northStar}
</p>
    </div>  

    {/* Star */}  
    <div className="absolute top-23 left-1/2 -translate-x-1/2">  
      <NorthStar />  
    </div>  

    {/* Journey Line */}  
    <div className="absolute top-30 left-1/2 -translate-x-1/2">  
      <div className="h-[430px] w-[2px] rounded-full bg-gradient-to-b from-white via-cyan-400 to-blue-700" />  
    </div>  

    {/* Purpose */}  
    <div className="absolute top-40 left-1/2 translate-x-[-10px]">  
    <Milestone
  title="Purpose"
  subtitle={dashboard.compass.northStar}
  side="left"
/>
    </div>  

    {/* Current Mission */}  
    <div className="absolute top-70 left-1/2 -translate-x-[221px]">  
     <Milestone
  title="Current Mission"
  subtitle={dashboard.mission.title}
  side="right"
/>
    </div>  
    {/* Skill Growth */}  
    <div className="absolute top-[390px] left-1/2 translate-x-[-10px]">  
      <Milestone  
        title="Skill Growth"  
        subtitle={skills.join(" • ")}
        side="left"  
        compact
      />  
    </div>

{/* YOU MARKER */}
<div
  className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out"
  style={{
    top: `${orbTop}px`,
  }}
>
  <div
    className="
      flex h-8 w-8 items-center justify-center
      rounded-full
      border-2 border-cyan-100
      bg-cyan-400
      text-[7px]
      font-bold
      uppercase
      tracking-tight
      text-slate-950
      shadow-[0_0_15px_rgba(34,211,238,0.8),0_0_35px_rgba(34,211,238,0.7),0_0_60px_rgba(34,211,238,0.5)]
      animate-pulse
    "
  >
    YOU
  </div>
</div>
  </div>  

</main>

);
}