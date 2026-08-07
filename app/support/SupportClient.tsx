"use client";

import SupportAdminButton from "./components/SupportAdminButton";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import SupportEscalation from "./components/SupportEscalation";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Compass,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import type {
  SupportDiagnosis,
  SupportMessage,
  SupportResponse,
} from "@/lib/support/types";

type QuickTopic = {
  title: string;
  description: string;
  prompt: string;
  icon: typeof LifeBuoy;
};

const quickTopics: QuickTopic[] = [
  {
    title: "Account Access",
    description:
      "Sign-in, sign-up and authentication problems.",
    prompt:
      "I need help accessing my ASCEND account.",
    icon: ShieldCheck,
  },
  {
    title: "Atlas & Missions",
    description:
      "Incorrect answers, missions or mission completion.",
    prompt:
      "I am having a problem with Atlas or my current mission.",
    icon: Compass,
  },
  {
    title: "Opportunities",
    description:
      "Loading, filtering, saving and decision-page issues.",
    prompt:
      "I need help with the ASCEND Opportunities page.",
    icon: MessageSquare,
  },
  {
    title: "Technical Problem",
    description:
      "Errors, blank pages and features not responding.",
    prompt:
      "An ASCEND feature is not working correctly.",
    icon: Wrench,
  },
];

function createMessage(
  role: SupportMessage["role"],
  content: string
): SupportMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,

    role,

    content,

    createdAt:
      new Date().toISOString(),
  };
}

function getUrgencyTheme(
  urgency: SupportDiagnosis["urgency"]
): string {
  if (urgency === "critical") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }

  if (urgency === "high") {
    return "border-orange-400/30 bg-orange-400/10 text-orange-200";
  }

  if (urgency === "low") {
    return "border-slate-400/20 bg-slate-400/10 text-slate-300";
  }

  return "border-blue-400/30 bg-blue-400/10 text-blue-200";
}

export default function SupportPage() {
  const [message, setMessage] =
    useState("");

  const [
    conversation,
    setConversation,
  ] = useState<SupportMessage[]>([]);

  const [
    diagnosis,
    setDiagnosis,
  ] = useState<SupportDiagnosis | null>(
    null
  );

  const [
    suggestedActions,
    setSuggestedActions,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const conversationEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
    });
  }, [conversation, loading]);

  async function submitSupportRequest(
    text: string
  ) {
    const trimmedMessage =
      text.trim();

    if (
      !trimmedMessage ||
      loading
    ) {
      return;
    }

    const userMessage =
      createMessage(
        "user",
        trimmedMessage
      );

    const previousConversation =
      conversation;

    setConversation((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/support",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message:
              trimmedMessage,

            conversation:
              previousConversation,

            currentPath:
              window.location.pathname,

            browser:
              window.navigator
                .userAgent,
          }),
        }
      );

      const data =
        (await response.json()) as
          | SupportResponse
          | {
              error?: string;
            };

      if (!response.ok) {
        throw new Error(
          "error" in data &&
          data.error
            ? data.error
            : "ASCEND Support could not process your request."
        );
      }

      const supportData =
        data as SupportResponse;

      setConversation((current) => [
        ...current,

        createMessage(
          "assistant",
          supportData.reply
        ),
      ]);

      setDiagnosis(
        supportData.diagnosis
      );

      setSuggestedActions(
        supportData.suggestedActions ??
          []
      );
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "ASCEND Support could not process your request.";

      setError(errorMessage);

      setConversation((current) => [
        ...current,

        createMessage(
          "assistant",
          "I could not complete the support diagnosis. Please try again, or describe the exact page and error message you encountered."
        ),
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void submitSupportRequest(
      message
    );
  }

  function resetSupportSession() {
    setConversation([]);
    setDiagnosis(null);
    setSuggestedActions([]);
    setMessage("");
    setError("");
  }

  const hasConversation =
    conversation.length > 0;

  const initialUserMessage =
    conversation.find(
      (item) =>
        item.role === "user"
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07111f] to-[#0f172a] text-white">
      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Header */}

        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft
              size={17}
              aria-hidden="true"
            />

            Back to ASCEND
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <SupportAdminButton />

            {hasConversation && (
              <button
                type="button"
                onClick={resetSupportSession}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Start New Diagnosis
              </button>
            )}
          </div>
        </header>

        {/* Introduction */}

        <section className="mx-auto max-w-3xl pb-10 pt-14 text-center">
          <div className="relative mx-auto h-20 w-20">
            <Image
              src="/ascend-navbar-logo.png"
              alt=""
              fill
              priority
              sizes="80px"
              className="object-contain"
            />
          </div>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            ASCEND Support AI
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Diagnose. Resolve.

            <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Keep moving forward.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Describe what you were trying to do
            and what happened instead. Support AI
            will identify the problem and guide you
            through the safest next steps.
          </p>
        </section>

        {!hasConversation ? (
          <section className="mx-auto max-w-5xl">
            {/* Initial support input */}

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-blue-400/20 bg-slate-950/60 p-4 shadow-2xl shadow-blue-950/20 sm:p-5"
            >
              <label
                htmlFor="support-message"
                className="sr-only"
              >
                Describe your ASCEND problem
              </label>

              <textarea
                id="support-message"
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Tell us what happened, the page you were using and any error message you saw..."
                maxLength={4000}
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-base leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.06]"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-slate-600">
                  Never share passwords,
                  authentication codes or API
                  keys.
                </p>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !message.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Diagnose Issue

                  <ChevronRight
                    size={17}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>

            {/* Quick topics */}

            <div className="mt-10">
              <p className="mb-4 text-sm font-semibold text-slate-400">
                Or choose an area
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickTopics.map(
                  (topic) => {
                    const Icon =
                      topic.icon;

                    return (
                      <button
                        key={
                          topic.title
                        }
                        type="button"
                        onClick={() =>
                          void submitSupportRequest(
                            topic.prompt
                          )
                        }
                        className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                          <Icon
                            size={20}
                            aria-hidden="true"
                          />
                        </div>

                        <h2 className="mt-5 font-semibold text-white">
                          {
                            topic.title
                          }
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {
                            topic.description
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
            {/* Support conversation */}

            <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-slate-950/40">
              <div className="border-b border-white/10 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <LifeBuoy
                      size={20}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Support Session
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Separate from Atlas
                      strategy and memory
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[620px] min-h-[420px] space-y-5 overflow-y-auto p-5 sm:p-7">
                {conversation.map(
                  (item) => (
                    <article
                      key={item.id}
                      className={`max-w-[92%] rounded-2xl px-5 py-4 ${
                        item.role ===
                        "user"
                          ? "ml-auto bg-blue-600 text-white"
                          : "mr-auto border border-white/10 bg-white/[0.045] text-slate-200"
                      }`}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                        {item.role ===
                        "user"
                          ? "You"
                          : "ASCEND Support"}
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-7 sm:text-base">
                        {item.content}
                      </p>
                    </article>
                  )
                )}

                {loading && (
                  <div className="mr-auto flex max-w-[92%] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 text-slate-400">
                    <Loader2
                      size={18}
                      className="animate-spin text-cyan-300"
                      aria-hidden="true"
                    />

                    <span className="text-sm">
                      Support AI is
                      diagnosing the issue...
                    </span>
                  </div>
                )}

                <div
                  ref={
                    conversationEndRef
                  }
                />
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-white/10 p-4 sm:p-5"
              >
                <div className="relative">
                  <label
                    htmlFor="support-follow-up"
                    className="sr-only"
                  >
                    Continue the support
                    conversation
                  </label>

                  <textarea
                    id="support-follow-up"
                    value={message}
                    onChange={(event) =>
                      setMessage(
                        event.target.value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        if (
                          message.trim() &&
                          !loading
                        ) {
                          void submitSupportRequest(
                            message
                          );
                        }
                      }
                    }}
                    placeholder="Reply with more details..."
                    rows={2}
                    maxLength={4000}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-4 pr-16 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !message.trim()
                    }
                    aria-label="Send support message"
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Send
                        size={18}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Diagnostic panel */}

            <aside className="space-y-5 lg:sticky lg:top-28">
              {/* Live diagnosis */}

              <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Live Diagnosis
                </p>

                {diagnosis ? (
                  <>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium capitalize text-cyan-200">
                        {
                          diagnosis.category
                        }
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getUrgencyTheme(
                          diagnosis.urgency
                        )}`}
                      >
                        {
                          diagnosis.urgency
                        }{" "}
                        urgency
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-white">
                      {diagnosis.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {
                        diagnosis.summary
                      }
                    </p>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <div className="flex items-center gap-2">
                        {diagnosis.requiresEscalation ? (
                          <AlertTriangle
                            size={17}
                            className="text-amber-300"
                            aria-hidden="true"
                          />
                        ) : (
                          <CheckCircle2
                            size={17}
                            className="text-emerald-300"
                            aria-hidden="true"
                          />
                        )}

                        <p className="text-sm font-medium text-white">
                          {diagnosis.requiresEscalation
                            ? "Escalation may be required"
                            : "Guided resolution available"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-slate-500">
                    Support AI is reviewing
                    the information you
                    provided.
                  </p>
                )}
              </section>

              {/* Suggested actions */}

              {suggestedActions.length >
                0 && (
                <section className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.05] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                    Recommended Checks
                  </p>

                  <ol className="mt-5 space-y-4">
                    {suggestedActions.map(
                      (
                        action,
                        index
                      ) => (
                        <li
                          key={`${action}-${index}`}
                          className="flex gap-3 text-sm leading-6 text-slate-300"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-400/10 text-xs font-semibold text-blue-300">
                            {index + 1}
                          </span>

                          <span>
                            {action}
                          </span>
                        </li>
                      )
                    )}
                  </ol>
                </section>
              )}

              {/* Case escalation */}

              {diagnosis &&
                initialUserMessage && (
                  <SupportEscalation
                    key={
                      initialUserMessage.id
                    }
                    initialMessage={
                      initialUserMessage.content
                    }
                    diagnosis={
                      diagnosis
                    }
                    conversation={
                      conversation
                    }
                    suggestedActions={
                      suggestedActions
                    }
                  />
                )}

              {/* Privacy */}

              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-sm font-medium text-white">
                  Your privacy matters
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Never send passwords,
                  one-time codes, API keys or
                  complete payment details.
                  Support AI will never ask for
                  them.
                </p>
              </section>

              {error && (
                <section className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5">
                  <p className="text-sm leading-6 text-rose-200">
                    {error}
                  </p>
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}