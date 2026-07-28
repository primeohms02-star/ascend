"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useAuth,
} from "@clerk/nextjs";

import {
  useParams,
} from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock3,
  Compass,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

import type {
  SupportCase,
  SupportCaseStatus,
  SupportUrgency,
} from "@/lib/support/types";

type CaseResponse =
  | {
      success: true;
      supportCase: SupportCase;
    }
  | {
      success: false;
      error: string;
    };

const statusLabels: Record<
  SupportCaseStatus,
  string
> = {
  open: "Open",
  investigating: "Investigating",
  waiting_for_user:
    "Waiting for You",
  resolved: "Resolved",
  closed: "Closed",
};

const statusDescriptions: Record<
  SupportCaseStatus,
  string
> = {
  open:
    "Your case has been received and is waiting for review.",

  investigating:
    "ASCEND Support is currently investigating your issue.",

  waiting_for_user:
    "Support needs additional information from you.",

  resolved:
    "A resolution has been provided for this case.",

  closed:
    "This support case has been closed.",
};

const urgencyLabels: Record<
  SupportUrgency,
  string
> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  critical: "Critical",
};

function getStatusClasses(
  status: SupportCaseStatus
): string {
  switch (status) {
    case "resolved":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "closed":
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";

    case "investigating":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "waiting_for_user":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    default:
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
  }
}

function getUrgencyClasses(
  urgency: SupportUrgency
): string {
  switch (urgency) {
    case "critical":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";

    case "high":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "low":
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";

    default:
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
  }
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function CaseLoading() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <LoaderCircle
        size={34}
        className="mx-auto animate-spin text-cyan-300"
      />

      <h2 className="mt-5 text-xl font-semibold text-white">
        Retrieving your case
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        ASCEND is securely checking the support record.
      </p>
    </div>
  );
}

export default function SupportCasePage() {
  const params =
    useParams<{
      reference: string;
    }>();

  const {
    isLoaded,
    userId,
  } = useAuth();

  const referenceNumber =
    useMemo(
      () =>
        decodeURIComponent(
          params.reference ?? ""
        )
          .trim()
          .toUpperCase(),
      [params.reference]
    );

  const [
    contactEmail,
    setContactEmail,
  ] = useState("");

  const [
    supportCase,
    setSupportCase,
  ] =
    useState<SupportCase | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  const retrieveCase =
    useCallback(
      async (
        email?: string
      ) => {
        if (!referenceNumber) {
          setError(
            "The support case reference is missing."
          );

          return;
        }

        setLoading(true);
        setError("");

        try {
          const query =
            email?.trim()
              ? `?email=${encodeURIComponent(
                  email
                    .trim()
                    .toLowerCase()
                )}`
              : "";

          const response =
            await fetch(
              `/api/support/cases/${encodeURIComponent(
                referenceNumber
              )}${query}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          const data =
            (await response.json()) as CaseResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.success
                ? "ASCEND could not retrieve this case."
                : data.error
            );
          }

          setSupportCase(
            data.supportCase
          );
        } catch (error) {
          setSupportCase(null);

          setError(
            error instanceof Error
              ? error.message
              : "ASCEND could not retrieve this case."
          );
        } finally {
          setLoading(false);
        }
      },
      [referenceNumber]
    );

  useEffect(() => {
    if (
      !isLoaded ||
      !userId
    ) {
      return;
    }

    retrieveCase();
  }, [
    isLoaded,
    userId,
    retrieveCase,
  ]);

  async function handleGuestLookup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !contactEmail.trim()
    ) {
      setError(
        "Enter the email address used when the case was created."
      );

      return;
    }

    await retrieveCase(
      contactEmail
    );
  }

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(
        referenceNumber
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1800
      );
    } catch {
      setCopied(false);
    }
  }

  const showGuestForm =
    isLoaded &&
    !userId &&
    !supportCase;

  return (
    <main className="min-h-screen bg-[#05070B] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft
              size={17}
              aria-hidden="true"
            />

            Back to Support
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-slate-400 transition hover:text-white"
          >
            <Compass
              size={18}
              className="text-cyan-300"
              aria-hidden="true"
            />

            ASCEND
          </Link>
        </div>

        <header className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Support Case
          </p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Track your support case
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                View the current status, diagnosis and recommended actions for your ASCEND support request.
              </p>
            </div>

            <button
              type="button"
              onClick={
                copyReference
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              {copied ? (
                <CheckCircle2
                  size={17}
                  className="text-emerald-300"
                />
              ) : (
                <Clipboard
                  size={17}
                />
              )}

              {copied
                ? "Copied"
                : referenceNumber}
            </button>
          </div>
        </header>

        <div className="mt-10">
          {!isLoaded && (
            <CaseLoading />
          )}

          {isLoaded &&
            userId &&
            loading &&
            !supportCase && (
              <CaseLoading />
            )}

          {showGuestForm && (
            <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <ShieldCheck
                  size={27}
                />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Verify your case
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter the same email address you supplied when this support case was created.
              </p>

              <form
                onSubmit={
                  handleGuestLookup
                }
                className="mt-7"
              >
                <label
                  htmlFor="support-email"
                  className="text-sm font-medium text-slate-300"
                >
                  Contact email
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="support-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={
                      contactEmail
                    }
                    onChange={(
                      event
                    ) =>
                      setContactEmail(
                        event.target
                          .value
                      )
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Search
                      size={19}
                    />
                  )}

                  {loading
                    ? "Checking..."
                    : "View Case"}
                </button>
              </form>
            </section>
          )}

          {error && (
            <section className="mx-auto mt-6 max-w-xl rounded-3xl border border-rose-400/20 bg-rose-400/[0.07] p-6 text-center">
              <AlertCircle
                size={30}
                className="mx-auto text-rose-300"
              />

              <h2 className="mt-4 text-lg font-semibold">
                Case unavailable
              </h2>

              <p className="mt-2 text-sm leading-6 text-rose-200/80">
                {error}
              </p>

              {userId && (
                <button
                  type="button"
                  onClick={() =>
                    retrieveCase()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-300/15"
                >
                  <RefreshCw
                    size={17}
                  />

                  Try Again
                </button>
              )}
            </section>
          )}

          {supportCase && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Case title
                      </p>

                      <h2 className="mt-3 text-2xl font-bold leading-tight">
                        {
                          supportCase.title
                        }
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                          supportCase.status
                        )}`}
                      >
                        {
                          statusLabels[
                            supportCase
                              .status
                          ]
                        }
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getUrgencyClasses(
                          supportCase.urgency
                        )}`}
                      >
                        {
                          urgencyLabels[
                            supportCase
                              .urgency
                          ]
                        }{" "}
                        priority
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 rounded-2xl border border-white/[0.07] bg-slate-950/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                      Current status
                    </p>

                    <p className="mt-3 leading-7 text-slate-300">
                      {
                        statusDescriptions[
                          supportCase
                            .status
                        ]
                      }
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                  <h2 className="text-xl font-bold">
                    Reported issue
                  </h2>

                  <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">
                    {
                      supportCase.initialMessage
                    }
                  </p>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                  <h2 className="text-xl font-bold">
                    Support diagnosis
                  </h2>

                  <p className="mt-4 leading-7 text-slate-300">
                    {
                      supportCase.diagnosis
                        .summary
                    }
                  </p>

                  {supportCase
                    .diagnosis
                    .possibleCauses
                    .length >
                    0 && (
                    <div className="mt-7">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Possible causes
                      </h3>

                      <ul className="mt-4 space-y-3">
                        {supportCase.diagnosis.possibleCauses.map(
                          (
                            cause,
                            index
                          ) => (
                            <li
                              key={`${cause}-${index}`}
                              className="flex gap-3 text-sm leading-6 text-slate-300"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

                              {cause}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </section>

                {supportCase
                  .suggestedActions
                  .length > 0 && (
                  <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                    <h2 className="text-xl font-bold">
                      Recommended actions
                    </h2>

                    <ol className="mt-5 space-y-4">
                      {supportCase.suggestedActions.map(
                        (
                          action,
                          index
                        ) => (
                          <li
                            key={`${action}-${index}`}
                            className="flex gap-4 rounded-2xl border border-white/[0.07] bg-slate-950/50 p-4"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">
                              {index +
                                1}
                            </span>

                            <p className="text-sm leading-6 text-slate-300">
                              {
                                action
                              }
                            </p>
                          </li>
                        )
                      )}
                    </ol>
                  </section>
                )}

                {supportCase.resolution && (
                  <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.07] p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={24}
                        className="text-emerald-300"
                      />

                      <h2 className="text-xl font-bold">
                        Resolution
                      </h2>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap leading-7 text-emerald-100/80">
                      {
                        supportCase.resolution
                      }
                    </p>
                  </section>
                )}
              </div>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <h2 className="font-semibold">
                    Case details
                  </h2>

                  <dl className="mt-6 space-y-5">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Reference
                      </dt>

                      <dd className="mt-2 break-all text-sm font-semibold text-cyan-300">
                        {
                          supportCase.referenceNumber
                        }
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Category
                      </dt>

                      <dd className="mt-2 capitalize text-sm text-slate-300">
                        {
                          supportCase.category
                        }
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <CalendarDays
                          size={14}
                        />

                        Created
                      </dt>

                      <dd className="mt-2 text-sm text-slate-300">
                        {formatDate(
                          supportCase.createdAt
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <Clock3
                          size={14}
                        />

                        Last updated
                      </dt>

                      <dd className="mt-2 text-sm text-slate-300">
                        {formatDate(
                          supportCase.updatedAt
                        )}
                      </dd>
                    </div>

                    {supportCase.currentPath && (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Affected page
                        </dt>

                        <dd className="mt-2 break-all text-sm text-slate-300">
                          {
                            supportCase.currentPath
                          }
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                <section className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.05] p-6">
                  <ShieldCheck
                    size={24}
                    className="text-cyan-300"
                  />

                  <h2 className="mt-4 font-semibold">
                    Support privacy
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    This support case is separate from Atlas and does not modify your North Star, missions, XP, identity or Atlas memory.
                  </p>
                </section>

                <button
                  type="button"
                  onClick={() =>
                    retrieveCase(
                      userId
                        ? undefined
                        : contactEmail
                    )
                  }
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh Status
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}