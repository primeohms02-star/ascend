"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Paperclip, X } from "lucide-react";

import AppShell from "@/app/components/navigation/AppShell";
import { ATLAS_CONTEXT_SESSION_KEY } from "@/app/components/atlas/ContextualAtlasLink";
import { getGreeting } from "@/lib/utils/greeting";

import CompassRose from "@/app/components/atlas/CompassRose";
import AtlasMessageContent from "./AtlasMessageContent";
import ConversationCard from "@/app/components/atlas/ConversationCard";

type ConversationItem = {
  role: "user" | "atlas";
  message: string;
  attachmentName?: string;
};

type BriefingState = {
  summary: string;
  focus: string;
  oracle: string;
};

type AtlasAttachment = {
  name: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  dataUrl: string;
};

const suggestions = [
  "Make a difficult decision",
  "Plan my day",
  "Find opportunities",
  "I'm feeling stuck",
  "Reflect",
  "Talk with Atlas",
];

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSourceImageBytes = 12 * 1024 * 1024;
const maxEncodedImageLength = 3_700_000;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.readAsDataURL(file);
  });
}

async function compressImageForAtlas(file: File): Promise<AtlasAttachment | null> {
  const originalDataUrl = await readFileAsDataUrl(file);

  if (originalDataUrl.length <= maxEncodedImageLength) {
    return {
      name: file.name,
      mimeType: file.type as AtlasAttachment["mimeType"],
      dataUrl: originalDataUrl,
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Image could not be decoded."));
      element.src = objectUrl;
    });

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(image, 0, 0, width, height);

    for (const quality of [0.84, 0.72, 0.6]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= maxEncodedImageLength) {
        return {
          name: file.name.replace(/\.[^.]+$/, "") + ".jpg",
          mimeType: "image/jpeg",
          dataUrl,
        };
      }
    }

    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function AtlasComposer({
  message,
  setMessage,
  loading,
  attachment,
  attachmentError,
  onFileChange,
  onRemoveAttachment,
  onSend,
  placeholder,
}: {
  message: string;
  setMessage: (value: string) => void;
  loading: boolean;
  attachment: AtlasAttachment | null;
  attachmentError: string;
  onFileChange: (file: File | null) => void;
  onRemoveAttachment: () => void;
  onSend: () => void;
  placeholder: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = Boolean(message.trim() || attachment);

  return (
    <div>
      {attachment && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-200">
              <ImageIcon size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{attachment.name}</span>
              <span className="block text-xs text-slate-500">Image ready for Atlas</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveAttachment}
            aria-label="Remove image"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {attachmentError && (
        <p role="alert" className="mb-3 text-sm text-rose-300">
          {attachmentError}
        </p>
      )}

      <div className="relative w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Upload an image to Atlas"
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          <Paperclip size={19} aria-hidden="true" />
        </button>

        <input
          type="text"
          value={message}
          disabled={loading}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-full border border-white/10 bg-[#101014]/94 py-4.5 pl-16 pr-20 text-base text-white shadow-lg outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:bg-[#141418] disabled:opacity-60 sm:text-lg"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={loading || !canSend}
          aria-label="Send message to Atlas"
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "➜"}
        </button>
      </div>
    </div>
  );
}

export default function AtlasPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [surfaceContext, setSurfaceContext] = useState("");
  const [attachment, setAttachment] = useState<AtlasAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState("");

  const [briefing, setBriefing] = useState<BriefingState>({
    summary: "Loading your briefing...",
    focus: "",
    oracle: "",
  });

  const [history, setHistory] = useState<ConversationItem[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<ConversationItem[]>([]);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contextualPrompt = params.get("prompt")?.trim();
    const contextualSurface = params.get("context")?.trim();
    let storedSurface = "";

    try {
      storedSurface = window.sessionStorage.getItem(ATLAS_CONTEXT_SESSION_KEY)?.trim() ?? "";
      window.sessionStorage.removeItem(ATLAS_CONTEXT_SESSION_KEY);
    } catch {
      storedSurface = "";
    }

    if (contextualPrompt) {
      setMessage(contextualPrompt.slice(0, 1200));
    }

    if (storedSurface || contextualSurface) {
      setSurfaceContext((storedSurface || contextualSurface || "").slice(0, 2200));
    }
  }, []);

  useEffect(() => {
    if (currentConversation.length === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      conversationEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentConversation]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBriefing() {
      try {
        const response = await fetch("/api/atlas/briefing", { signal: controller.signal });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Atlas could not load your briefing.");
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
          focus: "Review your Home page for your current direction.",
          oracle: "Your conversation is still available.",
        });
      }
    }

    loadBriefing();
    return () => controller.abort();
  }, []);

  async function handleImageFile(file: File | null) {
    setAttachmentError("");

    if (!file) {
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      setAttachmentError("Atlas supports JPEG, PNG and WebP images.");
      return;
    }

    if (file.size > maxSourceImageBytes) {
      setAttachmentError("Please choose an image smaller than 12 MB.");
      return;
    }

    const prepared = await compressImageForAtlas(file).catch(() => null);

    if (!prepared) {
      setAttachmentError("Atlas could not prepare that image. Try a smaller JPEG, PNG or WebP image.");
      return;
    }

    setAttachment(prepared);
  }

  async function loadHistory() {
    if (historyLoaded || historyLoading) {
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch("/api/atlas/history", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Atlas could not load your conversation history.");
      }

      if (Array.isArray(data.conversation)) {
        setHistory(
          data.conversation.filter(
            (item: ConversationItem) =>
              (item.role === "user" || item.role === "atlas") && typeof item.message === "string"
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

    if ((!prompt && !attachment) || loading) {
      return;
    }

    const visiblePrompt = prompt || "Please analyze this image.";
    const imageForRequest = attachment;

    setLoading(true);
    setMessage("");

    setCurrentConversation((current) => [
      ...current,
      { role: "user", message: visiblePrompt, attachmentName: imageForRequest?.name },
      { role: "atlas", message: "Atlas is thinking..." },
    ]);

    try {
      const response = await fetch("/api/atlas/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          context: surfaceContext || undefined,
          image: imageForRequest || undefined,
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
          message: data.reply ?? "I couldn't form a response. Please ask again.",
        };
        return updated;
      });

      setAttachment(null);
      setAttachmentError("");
    } catch (error) {
      console.error("Atlas Conversation Error:", error);

      setCurrentConversation((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          role: "atlas",
          message:
            error instanceof Error ? error.message : "Atlas encountered an error. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  const composerProps = {
    message,
    setMessage,
    loading,
    attachment,
    attachmentError,
    onFileChange: handleImageFile,
    onRemoveAttachment: () => {
      setAttachment(null);
      setAttachmentError("");
    },
    onSend: () => sendToAtlas(),
  };

  return (
    <AppShell>
      <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-black via-[#0A0A0F] to-[#18181B] px-5 py-20 text-white sm:px-8">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="absolute left-5 top-6 z-20 rounded-full border border-white/10 bg-[#111116]/90 px-5 py-2 text-sm text-slate-300 transition hover:border-amber-400 hover:text-white sm:left-8 sm:top-8"
        >
          ← Home
        </button>

        <CompassRose />

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl font-semibold tracking-[0.2em] sm:text-6xl sm:tracking-[0.25em]">ATLAS</h1>
            <p className="mb-10 text-center text-lg text-slate-300 sm:text-xl">Where would you like to go today?</p>

            {currentConversation.length === 0 && (
              <div className="w-full">
                <AtlasComposer {...composerProps} placeholder="Ask Atlas anything..." />
              </div>
            )}

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
                  <p className="text-center text-sm text-slate-500">Loading previous conversations...</p>
                ) : history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={`history-${item.role}-${index}`}
                      className={
                        item.role === "user"
                          ? "ml-auto max-w-[88%] rounded-2xl border border-amber-200/20 bg-amber-400 px-4 py-3.5 text-[#17120A] sm:max-w-2xl sm:px-5 sm:py-4"
                          : "mr-auto w-full max-w-3xl"
                      }
                    >
                      {item.role === "user" ? (
                        <>
                          <p className="mb-2 text-sm font-semibold">You</p>
                          {item.attachmentName && (
                            <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-black/10 px-2.5 py-1.5 text-xs font-medium">
                              <ImageIcon size={14} aria-hidden="true" />
                              {item.attachmentName}
                            </p>
                          )}
                          <AtlasMessageContent content={item.message} isUser />
                        </>
                      ) : (
                        <div>
                          <div className="mb-2.5 flex items-center gap-2 px-1">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/[0.08] text-[10px] font-black tracking-[0.08em] text-amber-200">A</div>
                            <p className="text-sm font-semibold text-white">Atlas</p>
                          </div>
                          <div className="px-1 pb-2 sm:px-2">
                            <AtlasMessageContent content={item.message} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : historyLoaded ? (
                  <p className="text-center text-sm text-slate-500">No previous Atlas conversation yet.</p>
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
                    ? "ml-auto max-w-[88%] rounded-2xl border border-amber-200/20 bg-amber-400 px-4 py-3.5 text-[#17120A] sm:max-w-2xl sm:px-5 sm:py-4"
                    : "mr-auto w-full max-w-3xl"
                }
              >
                {item.role === "user" ? (
                  <>
                    <p className="mb-2 text-sm font-semibold">You</p>
                    {item.attachmentName && (
                      <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-black/10 px-2.5 py-1.5 text-xs font-medium">
                        <ImageIcon size={14} aria-hidden="true" />
                        {item.attachmentName}
                      </p>
                    )}
                    <AtlasMessageContent content={item.message} isUser />
                  </>
                ) : (
                  <div>
                    <div className="mb-2.5 flex items-center gap-2 px-1">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/[0.08] text-[10px] font-black tracking-[0.08em] text-amber-200">A</div>
                      <p className="text-sm font-semibold text-white">Atlas</p>
                    </div>
                    <div className="px-1 pb-2 sm:px-2">
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
              <AtlasComposer {...composerProps} placeholder="Continue talking with Atlas..." />
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
