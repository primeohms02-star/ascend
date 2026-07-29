"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  SupportCaseMessage,
  SupportCaseStatus,
} from "@/lib/support/types";

type MessagesResponse =
  | {
      success: true;
      messages: SupportCaseMessage[];
    }
  | {
      success: false;
      error: string;
    };

type MessageResponse =
  | {
      success: true;
      supportMessage: SupportCaseMessage;
    }
  | {
      success: false;
      error: string;
    };

type Props = {
  referenceNumber: string;
  status: SupportCaseStatus;
  contactEmail?: string;
  onReplySent?: () => void;
};

function formatMessageDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function SupportCaseConversation({
  referenceNumber,
  status,
  contactEmail,
  onReplySent,
}: Props) {
  const [
    messages,
    setMessages,
  ] = useState<
    SupportCaseMessage[]
  >([]);

  const [
    reply,
    setReply,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const conversationEndRef =
    useRef<HTMLDivElement>(
      null
    );

  const buildEmailQuery =
    useCallback(() => {
      const email =
        contactEmail?.trim();

      if (!email) {
        return "";
      }

      return `?email=${encodeURIComponent(
        email.toLowerCase()
      )}`;
    }, [contactEmail]);

  const loadMessages =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              `/api/support/cases/${encodeURIComponent(
                referenceNumber
              )}/messages${buildEmailQuery()}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          const data =
            (await response.json()) as MessagesResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.success
                ? "ASCEND could not load this conversation."
                : data.error
            );
          }

          setMessages(
            data.messages
          );
        } catch (error) {
          setMessages([]);

          setError(
            error instanceof Error
              ? error.message
              : "ASCEND could not load this conversation."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        referenceNumber,
        buildEmailQuery,
      ]
    );

  useEffect(() => {
    setMessages([]);
    setReply("");
    setError("");

    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
        block: "nearest",
      }
    );
  }, [messages]);

  async function sendReply(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const message =
      reply.trim();

    if (!message) {
      setError(
        "Enter a reply before sending."
      );

      return;
    }

    setSending(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/support/cases/${encodeURIComponent(
            referenceNumber
          )}/messages`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message,

              contactEmail:
                contactEmail
                  ?.trim()
                  .toLowerCase(),
            }),
          }
        );

      const data =
        (await response.json()) as MessageResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.success
            ? "ASCEND could not send your reply."
            : data.error
        );
      }

      setMessages(
        (current) => [
          ...current,
          data.supportMessage,
        ]
      );

      setReply("");

      onReplySent?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ASCEND could not send your reply."
      );
    } finally {
      setSending(false);
    }
  }

  const closed =
    status === "closed";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <MessageSquare
              size={20}
            />
          </div>

          <div>
            <h2 className="font-semibold">
              Case Conversation
            </h2>

            <p className="text-xs text-slate-500">
              Communicate securely with ASCEND Support
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            loadMessages
          }
          disabled={
            loading
          }
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      <div className="max-h-[520px] min-h-[280px] overflow-y-auto p-6">
        {loading &&
        messages.length ===
          0 ? (
          <div className="flex min-h-[230px] items-center justify-center text-center">
            <div>
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-cyan-300"
              />

              <p className="mt-4 text-sm text-slate-500">
                Loading conversation...
              </p>
            </div>
          </div>
        ) : messages.length ===
          0 ? (
          <div className="flex min-h-[230px] items-center justify-center text-center">
            <div>
              <MessageSquare
                size={32}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-4 font-semibold">
                No replies yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Support replies and any additional information you provide will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(
              (message) => {
                const fromSupport =
                  message.senderType ===
                  "support";

                const systemMessage =
                  message.senderType ===
                  "system";

                if (
                  systemMessage
                ) {
                  return (
                    <div
                      key={
                        message.id
                      }
                      className="mx-auto max-w-xl rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-center"
                    >
                      <p className="text-xs leading-5 text-slate-500">
                        {
                          message.message
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-slate-700">
                        {formatMessageDate(
                          message.createdAt
                        )}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={
                      message.id
                    }
                    className={`flex ${
                      fromSupport
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl border p-4 ${
                        fromSupport
                          ? "border-cyan-400/20 bg-cyan-400/[0.09]"
                          : "border-blue-400/20 bg-blue-500/[0.12]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {fromSupport ? (
                          <ShieldCheck
                            size={15}
                            className="text-cyan-300"
                          />
                        ) : (
                          <UserRound
                            size={15}
                            className="text-blue-300"
                          />
                        )}

                        <p
                          className={`text-xs font-semibold ${
                            fromSupport
                              ? "text-cyan-300"
                              : "text-blue-300"
                          }`}
                        >
                          {fromSupport
                            ? message.senderName ||
                              "ASCEND Support"
                            : "You"}
                        </p>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                        {
                          message.message
                        }
                      </p>

                      <p className="mt-3 text-[10px] text-slate-600">
                        {formatMessageDate(
                          message.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                );
              }
            )}

            <div
              ref={
                conversationEndRef
              }
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-200">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>
            {error}
          </p>
        </div>
      )}

      <form
        onSubmit={
          sendReply
        }
        className="border-t border-white/[0.07] p-6"
      >
        <textarea
          value={reply}
          onChange={(
            event
          ) =>
            setReply(
              event.target
                .value
            )
          }
          disabled={
            sending ||
            closed
          }
          maxLength={5000}
          placeholder={
            closed
              ? "This case is closed and can no longer receive replies."
              : "Add more information or reply to ASCEND Support..."
          }
          className="min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            {reply.length}
            /5000 characters
          </p>

          <button
            type="submit"
            disabled={
              sending ||
              closed ||
              !reply.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Send
                size={17}
              />
            )}

            {sending
              ? "Sending..."
              : "Send Reply"}
          </button>
        </div>
      </form>
    </section>
  );
}