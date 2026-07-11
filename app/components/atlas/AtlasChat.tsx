"use client";

import { useState } from "react";

export default function AtlasChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Welcome back.\n\nAsk me anything about your journey."
  );
  const [loading, setLoading] = useState(false);

  async function askAtlas() {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await res.json();

      setAnswer(data.answer);
      setQuestion("");
    } catch {
      setAnswer("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-slate-800 p-6 whitespace-pre-wrap leading-8">
        {answer}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask Atlas anything..."
        className="h-40 w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 outline-none focus:border-orange-500"
      />

      <button
        onClick={askAtlas}
        disabled={loading}
        className="rounded-2xl bg-orange-500 px-8 py-4 font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Ask Atlas"}
      </button>

    </div>
  );
}