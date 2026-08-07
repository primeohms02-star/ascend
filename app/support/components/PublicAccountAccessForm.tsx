"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
} from "lucide-react";

import type {
  CreateSupportCaseResponse,
  SupportCaseErrorResponse,
} from "@/lib/support/types";

export default function PublicAccountAccessForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreateSupportCaseResponse | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanEmail || !cleanMessage || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/support/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initialMessage: `Account access issue: ${cleanMessage}`,
          conversation: [],
          suggestedActions: [],
          currentPath: window.location.pathname,
          browser: window.navigator.userAgent,
          contactEmail: cleanEmail,
        }),
      });

      const data = (await response.json()) as
        | CreateSupportCaseResponse
        | SupportCaseErrorResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.success
            ? "ASCEND could not create the support case."
            : data.error
        );
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ASCEND could not create the support case."
      );
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const supportCase = result.supportCase;
    const caseHref = `/support/cases/${encodeURIComponent(
      supportCase.referenceNumber
    )}?email=${encodeURIComponent(email.trim())}`;

    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={20} aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {result.duplicate ? "Existing Case Found" : "Support Case Created"}
            </p>
            <h2 className="mt-1.5 text-lg font-semibold text-white">
              We have your account-access request.
            </h2>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Case Reference
          </p>
          <p className="mt-1.5 font-mono text-sm font-semibold text-emerald-200">
            {supportCase.referenceNumber}
          </p>
        </div>

        <Link
          href={caseHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Open Support Case
          <ChevronRight size={17} aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Cannot access your account?
        </p>
        <h2 className="mt-1.5 text-xl font-semibold text-white">
          Request account-access help without Support AI.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          This form creates a trackable support case for sign-in or account-access problems. It does not open an anonymous AI conversation.
        </p>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="public-support-email" className="text-xs font-medium text-slate-300">
            Contact email
          </label>
          <div className="relative mt-2">
            <Mail
              size={17}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id="public-support-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/40"
            />
          </div>
        </div>

        <div>
          <label htmlFor="public-support-message" className="text-xs font-medium text-slate-300">
            What is preventing you from signing in?
          </label>
          <textarea
            id="public-support-message"
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Describe what happens when you try to sign in and include any error message you see."
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/40"
          />
        </div>

        {error && (
          <p className="text-sm leading-6 text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !message.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Creating Case...
            </>
          ) : (
            "Create Account-Access Case"
          )}
        </button>
      </form>
    </section>
  );
}
