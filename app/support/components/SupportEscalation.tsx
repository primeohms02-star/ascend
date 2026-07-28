"use client";

import {
  useState,
} from "react";

import {
  useAuth,
} from "@clerk/nextjs";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  Mail,
} from "lucide-react";

import type {
  CreateSupportCaseResponse,
  SupportCase,
  SupportCaseErrorResponse,
  SupportDiagnosis,
  SupportMessage,
} from "@/lib/support/types";

type Props = {
  initialMessage: string;
  diagnosis: SupportDiagnosis;
  conversation: SupportMessage[];
  suggestedActions: string[];
};

export default function SupportEscalation({
  initialMessage,
  diagnosis,
  conversation,
  suggestedActions,
}: Props) {
  const {
    isLoaded,
    userId,
  } = useAuth();

  const [expanded, setExpanded] =
    useState(false);

  const [contactEmail, setContactEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    createdCase,
    setCreatedCase,
  ] = useState<SupportCase | null>(
    null
  );

  const [duplicate, setDuplicate] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const isSignedIn =
    Boolean(userId);

  async function createCase() {
    if (loading || createdCase) {
      return;
    }

    if (
      !isSignedIn &&
      !contactEmail.trim()
    ) {
      setError(
        "Enter a contact email so ASCEND can identify and update your case."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/support/cases",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            initialMessage,
            diagnosis,
            conversation,
            suggestedActions,

            currentPath:
              window.location.pathname,

            browser:
              window.navigator
                .userAgent,

            contactEmail:
              isSignedIn
                ? undefined
                : contactEmail.trim(),
          }),
        }
      );

      const data =
        (await response.json()) as
          | CreateSupportCaseResponse
          | SupportCaseErrorResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.success
            ? "ASCEND could not create the support case."
            : data.error
        );
      }

      setCreatedCase(
        data.supportCase
      );

      setDuplicate(
        data.duplicate
      );

      setExpanded(true);
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

  async function copyReference() {
    if (!createdCase) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdCase.referenceNumber
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "The reference could not be copied automatically."
      );
    }
  }

  if (!isLoaded) {
    return (
      <div className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
    );
  }

  if (createdCase) {
    return (
      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <CheckCircle2
              size={20}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {duplicate
                ? "Existing Case Found"
                : "Support Case Created"}
            </p>

            <h3 className="mt-2 text-lg font-semibold text-white">
              {createdCase.title}
            </h3>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Case Reference
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="break-all font-mono text-base font-semibold text-emerald-200">
              {
                createdCase.referenceNumber
              }
            </p>

            <button
              type="button"
              onClick={() =>
                void copyReference()
              }
              aria-label="Copy case reference"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <CheckCircle2
                  size={17}
                />
              ) : (
                <Copy
                  size={17}
                />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium capitalize text-emerald-200">
            {createdCase.status}
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium capitalize text-slate-300">
            {createdCase.urgency} urgency
          </span>
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-400">
          Keep this reference number. It
          identifies your issue without adding
          anything to Atlas memory or your
          personal journey.
        </p>

        {copied && (
          <p className="mt-3 text-xs text-emerald-300">
            Reference copied.
          </p>
        )}

        {error && (
          <p className="mt-3 text-xs leading-5 text-rose-300">
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.055] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
          <AlertTriangle
            size={20}
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Case Escalation
          </p>

          <h3 className="mt-2 font-semibold text-white">
            Still need help?
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Create a trackable support case
            containing this diagnosis and
            conversation.
          </p>
        </div>
      </div>

      {!expanded ? (
        <button
          type="button"
          onClick={() =>
            setExpanded(true)
          }
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
        >
          Escalate This Issue

          <ChevronRight
            size={17}
            aria-hidden="true"
          />
        </button>
      ) : (
        <div className="mt-5 border-t border-white/10 pt-5">
          {!isSignedIn && (
            <div>
              <label
                htmlFor="support-contact-email"
                className="text-xs font-medium text-slate-300"
              >
                Contact email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={17}
                  aria-hidden="true"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="support-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(event) =>
                    setContactEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/40"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                This is used only to identify
                and follow up on the support
                case.
              </p>
            </div>
          )}

          {isSignedIn && (
            <p className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs leading-5 text-slate-400">
              This case will be connected to
              your authenticated ASCEND
              account.
            </p>
          )}

          {error && (
            <p className="mt-3 text-xs leading-5 text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() =>
                void createCase()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  />

                  Creating Case...
                </>
              ) : (
                "Create Support Case"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setError("");
              }}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}