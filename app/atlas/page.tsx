"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
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

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [briefing, setBriefing] =
    useState<BriefingState>({
      summary:
        "Loading your briefing...",
      focus: "",
      oracle: "",
    });

  const [history, setHistory] =
    useState<ConversationItem[]>([]);

  const [currentConversation, setCurrentConversation] =
    useState<ConversationItem[]>([]);

  const [showHistory, setShowHistory] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const historyEndRef =
    useRef<HTMLDivElement>(null);

  const conversationEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        const response = await fetch(
          "/api/atlas/history",
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Atlas could not load your conversation history."
          );
        }

        if (Array.isArray(data.conversation)) {
          setHistory(
            data.conversation.filter(
              (item: ConversationItem) =>
                (item.role === "user" ||
                  item.role === "atlas") &&
                typeof item.message === "string"
            )
          );
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Atlas History Error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (currentConversation.length === 0) {
      return;
    }

    conversationEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [currentConversation]);

  function revealHistory() {
    setShowHistory(true);

    window.setTimeout(() => {
      historyEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 80);
  }

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadBriefing() {
      try {
        const response = await fetch(
          "/api/atlas/briefing",
          {
            signal: controller.signal,
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Atlas could not load your briefing."
          );
        }

        setBriefing({
          summary:
            data.summary ??
            "Atlas has prepared today's briefing.",

          focus:
            typeof data.mission === "string"
              ? data.mission
              : data.mission?.mission ??
                "No active mission is available.",

          oracle:
            data.oracle ??
            (data.isNew
              ? "A new mission has been prepared for today."
              : "Continue executing your current mission."),
        });
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Briefing Error:",
          error
        );

        setBriefing({
          summary:
            "Atlas could not load your briefing.",

          focus:
            "Review your Dashboard for your current direction.",

          oracle:
            "Your conversation is still available.",
        });
      }
    }

    loadBriefing();

    return () => {
      controller.abort();
    };
  }, []);

  async function sendToAtlas(
    text?: string
  ) {
    const prompt =
      (text ?? message).trim();

    if (
      !prompt ||
      loading ||
      historyLoading
    ) {
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
      const response = await fetch(
        "/api/atlas/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          /*
           * The server obtains the user ID from
           * the authenticated Clerk session.
           */
          body: JSON.stringify({
            message: prompt,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Atlas could not answer that question."
        );
      }

      setCurrentConversation((current) => {
        const updated = [...current];

        updated[updated.length - 1] = {
          role: "atlas",
          message:
            data.reply ??
            "I couldn't form a response. Please ask again.",
        };

        return updated;
      });

      /*
       * Do not replace the briefing after a normal
       * conversation. Questions do not change the
       * live mission, progress, or North Star.
       */
    } catch (error) {
      console.error(
        "Atlas Conversation Error:",
        error
      );

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
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-b from-black via-[#0A0A0F] to-[#18181B] px-5 py-20 text-white sm:px-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-5 top-6 z-20 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 backdrop-blur-xl transition hover:border-amber-400 hover:text-white sm:left-8 sm:top-8"
      >
        ← Back
      </button>

      <CompassRose />

      <div
        aria-hidden="true"
        className="absolute h-[600px] w-[600px] rounded-full bg-amber-400/5 blur-[180px]"
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <motion.h1
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.9,
            }}
            className="mb-6 text-4xl font-semibold tracking-[0.2em] sm:text-6xl sm:tracking-[0.25em]"
          >
            ATLAS
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.35,
              duration: 0.9,
            }}
            className="mb-12 text-center text-xl text-slate-300 sm:text-2xl"
          >
            Where would you like to go
            today?
          </motion.p>

          {/* Primary input */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.7,
              duration: 0.8,
            }}
            className="relative w-full"
          >
            <input
              type="text"
              value={message}
              disabled={
                loading || historyLoading
              }
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  sendToAtlas();
                }
              }}
              placeholder="Ask Atlas anything..."
              className="w-full rounded-full border border-white/10 bg-white/5 px-7 py-5 pr-20 text-base text-white shadow-2xl backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-amber-400 focus:bg-white/10 disabled:opacity-60 sm:px-8 sm:text-lg"
            />

            <button
              type="button"
              onClick={() =>
                sendToAtlas()
              }
              disabled={
                loading ||
                historyLoading ||
                !message.trim()
              }
              aria-label="Send message to Atlas"
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "➜"}
            </button>
          </motion.div>

          {/* Suggestions */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 1.1,
              duration: 0.8,
            }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {suggestions.map(
              (suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    sendToAtlas(
                      suggestion
                    )
                  }
                  disabled={
                    loading || historyLoading
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition-all duration-300 hover:border-amber-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              )
            )}
          </motion.div>
        </div>

        {/* Live briefing */}

        <ConversationCard
          greeting={getGreeting()}
          summary={briefing.summary}
          focus={briefing.focus}
          oracle={briefing.oracle}
        />

        {/* Previous conversation history */}

        <section className="mt-8" aria-label="Atlas conversation history">
          {historyLoading ? (
            <p className="text-center text-sm text-slate-500">
              Checking previous conversations...
            </p>
          ) : history.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  showHistory
                    ? setShowHistory(false)
                    : revealHistory()
                }
                aria-expanded={showHistory}
                className="mx-auto flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-amber-400/60 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <span aria-hidden="true">
                  {showHistory ? "↑" : "↓"}
                </span>
                {showHistory
                  ? "Hide previous chat"
                  : "Show previous chat"}
              </button>

              <AnimatePresence initial={false}>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
                      {history.map((item, index) => (
                        <div
                          key={`history-${item.role}-${index}`}
                          className={
                            item.role === "user"
                              ? "ml-auto max-w-2xl rounded-[24px] border border-amber-200/20 bg-amber-400 px-5 py-4 text-[#17120A] shadow-[0_14px_36px_rgba(0,0,0,0.22)]"
                              : "mr-auto w-full max-w-3xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-white/[0.025] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-6"
                          }
                        >
                          {item.role === "user" ? (
                            <>
                              <p className="mb-2 text-sm font-semibold">You</p>
                              <AtlasMessageContent
                                content={item.message}
                                isUser
                              />
                            </>
                          ) : (
                            <div className="flex items-start gap-4">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-gradient-to-br from-amber-300/20 to-amber-500/5 text-xs font-black tracking-[0.08em] text-amber-200 shadow-[0_8px_24px_rgba(245,158,11,0.12)]">
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
                      <div ref={historyEndRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : null}
        </section>

        {/* Current conversation */}

        <div aria-live="polite" className="mt-8 space-y-5">
          {currentConversation.map((item, index) => (
            <div
              key={`current-${item.role}-${index}`}
              className={
                item.role === "user"
                  ? "ml-auto max-w-2xl rounded-[24px] border border-amber-200/20 bg-amber-400 px-5 py-4 text-[#17120A] shadow-[0_14px_36px_rgba(0,0,0,0.22)]"
                  : "mr-auto w-full max-w-3xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-white/[0.025] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-6"
              }
            >
              {item.role === "user" ? (
                <>
                  <p className="mb-2 text-sm font-semibold">You</p>
                  <AtlasMessageContent content={item.message} isUser />
                </>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-gradient-to-br from-amber-300/20 to-amber-500/5 text-xs font-black tracking-[0.08em] text-amber-200 shadow-[0_8px_24px_rgba(245,158,11,0.12)]">
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

        {/* Continue conversation */}

        {currentConversation.length > 0 && (
          <div className="mt-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="relative w-full">
              <input
                type="text"
                value={message}
                disabled={loading || historyLoading}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendToAtlas();
                  }
                }}
                placeholder="Continue talking with Atlas..."
                className="w-full rounded-full border border-white/10 bg-white/5 px-7 py-5 pr-20 text-base text-white supports-[backdrop-filter]:backdrop-blur-xl outline-none transition focus:border-amber-400 disabled:opacity-60 sm:px-8 sm:text-lg"
              />

              <button
                type="button"
                onClick={() => sendToAtlas()}
                disabled={loading || historyLoading || !message.trim()}
                aria-label="Send message to Atlas"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
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
