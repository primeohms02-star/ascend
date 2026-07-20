"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getGreeting } from "@/lib/utils/greeting";
import { motion } from "framer-motion";
import CompassRose from "@/app/components/atlas/CompassRose";
import ConversationCard from "@/app/components/atlas/ConversationCard";
import { useRouter } from "next/navigation";

export default function AtlasPage() {
  const { user } = useUser();
  const router = useRouter();
  const suggestions = [
    "Make a difficult decision",
    "Plan my day",
    "Find opportunities",
    "I'm feeling stuck",
    "Reflect",
    "Talk with Atlas",
  ];

const [message, setMessage] = useState("");
const [reply, setReply] = useState("");
const [loading, setLoading] = useState(false);
const [briefing, setBriefing] = useState({
  summary: "Loading your briefing...",
  focus: "",
  oracle: "",
});

const [conversation, setConversation] = useState<
  { role: "user" | "atlas"; message: string }[]
>([]);

const conversationEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  conversationEndRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}, [conversation]);

useEffect(() => {
  async function loadBriefing() {
    try {
      const res = await fetch("/api/atlas/briefing");

      const data = await res.json();

     setBriefing({
  summary:
    data.summary ??
    "Atlas has prepared today's briefing.",
  focus:
    typeof data.mission === "string"
      ? data.mission
      : data.mission?.mission ?? "No mission available.",
  oracle: data.isNew
    ? "A new mission has been prepared for today."
    : "Continue executing your current mission.",
});
    } catch (err) {
      console.error("Briefing error:", err);
    }
  }

  loadBriefing();
}, []);

async function sendToAtlas(text?: string) {
  const prompt = text ?? message;

  if (!prompt.trim()) return;

  setLoading(true);

  try {
    setConversation((prev) => [
  ...prev,
  {
    role: "user",
    message: prompt,
  },
]);



setConversation((prev) => [
  ...prev,
  {
    role: "atlas",
    message: "Atlas is thinking...",
  },
]);

const res = await fetch("/api/atlas/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
 body: JSON.stringify({
  message: prompt,
  clerkId: user?.id,
}),
});

const data = await res.json();

setConversation((prev) => {
  const updated = [...prev];

  updated[updated.length - 1] = {
    role: "atlas",
    message: data.reply,
  };

  return updated;
});

setReply(data.reply);

setBriefing({
  summary: "Atlas has prepared today's briefing.",
  focus: "Continue moving toward your North Star.",
  oracle:
    "Consistency is the bridge between intention and transformation.",
});

setMessage("");
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#0A0A0F] to-[#18181B] px-8 py-20 text-white">

<button
  onClick={() => router.back()}
  className="absolute left-8 top-8 z-20 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 backdrop-blur-xl transition hover:border-amber-400 hover:text-white"
>
  ← Back
</button>

      <CompassRose />

      <div className="absolute h-[600px] w-[600px] rounded-full bg-amber-400/5 blur-[180px]" />

      <div className="relative z-10 w-full max-w-4xl">

        <div className="flex flex-col items-center">

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mb-6 text-6xl font-semibold tracking-[0.25em]"
          >
            ATLAS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            className="mb-12 text-center text-2xl text-slate-300"
          >
            Where would you like to go today?
          </motion.p>

          <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7, duration: 0.8 }}
  className="relative w-full"
>
  <motion.input
    type="text"
    placeholder="Ask Atlas anything..."
    className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-5 pr-20 text-lg text-white shadow-2xl backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-amber-400 focus:bg-white/10"
value={message}
onChange={(e) => setMessage(e.target.value)}
onKeyDown={(e) => {
  if (e.key === "Enter") {
    sendToAtlas();
  }
}}
/>

  <button
  onClick={() => sendToAtlas()}
  disabled={loading}
  className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-amber-500 text-black font-bold transition hover:bg-amber-400 disabled:opacity-50"
>
  {loading ? "..." : "➜"}
</button>
</motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
          {suggestions.map((item) => (
  <button
    key={item}
    onClick={() => sendToAtlas(item)}
    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition-all duration-300 hover:border-amber-400 hover:bg-white/10 hover:text-white"
  >
    {item}
  </button>
))}
          </motion.div>

        </div>

    <ConversationCard
  greeting={getGreeting()}
  summary={briefing.summary}
  focus={briefing.focus}
  oracle={briefing.oracle}
/>

<div className="mt-8 space-y-5">
  {conversation.map((item, index) => (
    <div
      key={index}
      className={`rounded-3xl p-5 backdrop-blur-xl ${
        item.role === "user"
          ? "ml-auto max-w-2xl bg-amber-500 text-black"
          : "mr-auto max-w-3xl border border-white/10 bg-white/5 text-white"
      }`}
    >
      <p className="text-sm font-semibold mb-2">
        {item.role === "user" ? "You" : "Atlas"}
      </p>

      <p className="whitespace-pre-wrap">
        {item.message}
      </p>
    </div>
  ))}
</div>

<div ref={conversationEndRef} />

{conversation.length > 0 && (
  <div className="mt-8">
    <motion.div className="relative w-full">

      <input
        type="text"
        placeholder="Continue talking with Atlas..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendToAtlas();
        }}
        className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-5 pr-20 text-lg text-white backdrop-blur-xl outline-none"
      />

      <button
        onClick={() => sendToAtlas()}
        disabled={loading}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-amber-500 text-black"
      >
        {loading ? "..." : "➜"}
      </button>

    </motion.div>
  </div>
)}

      </div>

    </main>
  );
}