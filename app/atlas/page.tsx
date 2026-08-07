"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getGreeting } from "@/lib/utils/greeting";

import CompassRose from "@/app/components/atlas/CompassRose";
import AtlasMessageContent from "./AtlasMessageContent";
import ConversationCard from "@/app/components/atlas/ConversationCard";

type ConversationItem = {
  role: "user" | "atlas";
  message: string;
};

type BriefingState = {
  summary: string;
  focus: string;
  oracle: string;
};

const suggestions = [
  "Make a difficult decision",
  "Plan my day",
  "Find opportunities",
  "I'm feeling stuck",
  "Reflect",
  "Talk with Atlas",
];

export default function AtlasPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [briefing, setBriefing] = useState<BriefingState>({
    summary: "Loading your briefing...",
    focus: "",
    oracle: "",
  });

  const [history, setHistory] = useState<ConversationItem[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [currentConversation, setCurrentConversation] = useState<
    ConversationItem[]
  >([]);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConversation.length === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      conversationEndRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentConversation]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBriefing() {
      try {
        const response = await fetch("/api/atlas/briefing", {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Atlas could not load your briefing."
          );
        }

        setBriefing({
          summary: data.summary ?? "Atlas has prepared today's briefing.",
          focus:
            typeof data.mission === "string"
              ? data.mission
              : data.mission?.mission ?? "No active mission is available.",
          oracle:
            data.oracle ??
            (data.isNew
              ? "A new mission has been prepared for today."
              : "Continue executing your current mission."),
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Briefing Error:", error);

        setBriefing({
          summary: "Atlas could not load your briefing.",
          focus: "Review your Dashboard for your current direction.",
          oracle: "Your conversation is still available.",
        });
      }
    }

    loadBriefing();

    return () => controller.abort();
  }, []);

  async function loadHistory() {
    if (historyLoaded || historyLoading) {
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch("/api/atlas/history", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Atlas could not load your conversation history."
        );
      }

      if (Array.isArray(data.conversation)) {
        setHistory(
          data.conversation.filter(
            (item: ConversationItem) =>
              (item.role === "user" || item.role === "atlas") &&
              typeof item.message === "string"
          )
        );
      }

      setHistoryLoaded(true);
    } catch (error) {
      console.error("Atlas History Error:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function toggleHistory() {
    if (showHistory) {
      setShowHistory(false);
      return;
    }

    setShowHistory(true);
    await loadHistory();
  }

  async function sendToAtlas(text?: string) {
    const prompt = (text ?? message).trim();

    if (!prompt || loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    setCurrentConversation((current) => [
      ...current,
      {
        role: "user",
        message: prompt,
      },
      {
        role: "atlas",
        message: "Atlas is thinking...",
      },
    ]);

    try {
      const response = await fetch("/api/atlas/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Atlas could not answer that question.");
      }

      setCurrentConversation((current) => {
        const updated = [...current];

        updated[updated.length - 1] = {
          role: "atlas",
          message:
            data.reply ?? "I couldn't form a response. Please ask again.",
        };

        return updated;
      });
    } catch (error) {
      console.error("Atlas Conversation Error:", error);

      setCurrentConversation((current) => {
        const updated = [...current];

        updated[updated.length - 1] = {
          role: "atlas",
          message:
            error instanceof Error
              ? error.message
              : "Atlas encountered an error. Please try again.",
        };

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-black via-[#0A0A0F] to-[#18181B] px-5 py-20 text-white sm:px-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-5 top-6 z-20 rounded-full border border-white/10 bg-[#111116]/90 px-5 py-2 text-sm text-slate-300 transition hover:border-amber-400 hover:text-white sm:left-8 sm:top-8"
      >
        ← Back
      </button>

      <CompassRose />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <h1 className="mb-5 text-4xl font-semibold tracking-[0.2em] sm:text-6xl sm:tracking-[0.25em]">
            ATLAS
          </h1>

          <p className="mb-10 text-center text-lg text-slate-300 sm:text-xl">
            Where would you like to go today?
          </p>

          <div className="relative w-full">
            <input
              type="text"
              value={message}
              disabled={loading}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendToAtlas();
                }
              }}
              placeholder="Ask Atlas anything..."
              className="w-full rounded-full border border-white/10 bg-[#101014]/92 px-7 py-4.5 pr-20 text-base text-white shadow-lg outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:bg-[#141418] disabled:opacity-60 sm:px-8 sm:text-lg"
            />

            <button
              type="button"
              onClick={() => sendToAtlas()}
              disabled={loading || !message.trim()}
              aria-label="Send message to Atlas"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "➜"}
            </button>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendToAtlas(suggestion)}
                disabled={loading}
                className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm text-slate-300 transition hover:border-amber-400/60 hover:bg-white/[0.075] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <ConversationCard
          greeting={getGreeting()}
          summary={briefing.summary}
          focus={briefing.focus}
          oracle={briefing.oracle}
        />

        <section className="mt-7" aria-label="Atlas conversation history">
          <button
            type="button"
            onClick={toggleHistory}
            aria-expanded={showHistory}
            className="mx-auto flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-amber-400/60 hover:bg-white/[0.075] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <span aria-hidden="true">{showHistory ? "↑" : "↓"}</span>
            {showHistory ? "Hide previous chat" : "Show previous chat"}
          </button>

          {showHistory && (
            <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
              {historyLoading ? (
                <p className="text-center text-sm text-slate-500">
                  Loading previous conversations...
                </p>
              ) : history.length > 0 ? (
                history.map((item, index) => (
                  <div
                    key={`history-${item.role}-${index}`}
                    className={
                      item.role === "user"
                        ? "ml-auto max-w-2xl rounded-[22px] border border-amber-200/20 bg-amber-400 px-5 py-4 text-[#17120A] shadow-lg"
                        : "mr-auto w-full max-w-3xl rounded-[24px] border border-white/10 bg-[#111116]/92 p-5 text-white shadow-lg sm:p-6"
                    }
                  >
                    {item.role === "user" ? (
                      <>
                        <p className="mb-2 text-sm font-semibold">You</p>
                        <AtlasMessageContent content={item.message} isUser />
                      </>
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10 text-xs font-black tracking-[0.08em] text-amber-200">
                          A
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-3 text-sm font-semibold text-white">
                            Atlas
                          </p>
                          <AtlasMessageContent content={item.message} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : historyLoaded ? (
                <p className="text-center text-sm text-slate-500">
                  No previous Atlas conversation yet.
                </p>
              ) : null}
            </div>
          )}
        </section>

        <div aria-live="polite" className="mt-8 space-y-5">
          {currentConversation.map((item, index) => (
            <div
              key={`current-${item.role}-${index}`}
              className={
                item.role === "user"
                  ? "ml-auto max-w-2xl rounded-[22px] border border-amber-200/20 bg-amber-400 px-5 py-4 text-[#17120A] shadow-lg"
                  : "mr-auto w-full max-w-3xl rounded-[24px] border border-white/10 bg-[#111116]/92 p-5 text-white shadow-lg sm:p-6"
              }
            >
              {item.role === "user" ? (
                <>
                  <p className="mb-2 text-sm font-semibold">You</p>
                  <AtlasMessageContent content={item.message} isUser />
                </>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10 text-xs font-black tracking-[0.08em] text-amber-200">
                    A
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-3 text-sm font-semibold text-white">
                      Atlas
                    </p>
                    <AtlasMessageContent content={item.message} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div ref={conversationEndRef} />

        {currentConversation.length > 0 && (
          <div className="mt-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="relative w-full">
              <input
                type="text"
                value={message}
                disabled={loading}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendToAtlas();
                  }
                }}
                placeholder="Continue talking with Atlas..."
                className="w-full rounded-full border border-white/10 bg-[#101014]/94 px-7 py-4.5 pr-20 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:bg-[#141418] disabled:opacity-60 sm:px-8 sm:text-lg"
              />

              <button
                type="button"
                onClick={() => sendToAtlas()}
                disabled={loading || !message.trim()}
                aria-label="Send message to Atlas"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "..." : "➜"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
