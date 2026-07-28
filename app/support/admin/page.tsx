"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  SupportCase,
  SupportCaseStatus,
  SupportCategory,
  SupportUrgency,
} from "@/lib/support/types";

type CasesResponse =
  | {
      success: true;
      cases: SupportCase[];
      count: number;
    }
  | {
      success: false;
      error: string;
    };

type UpdateResponse =
  | {
      success: true;
      supportCase: SupportCase;
    }
  | {
      success: false;
      error: string;
    };

const statuses: {
  label: string;
  value:
    | SupportCaseStatus
    | "all";
}[] = [
  {
    label: "All Statuses",
    value: "all",
  },
  {
    label: "Open",
    value: "open",
  },
  {
    label: "Investigating",
    value: "investigating",
  },
  {
    label: "Waiting for User",
    value: "waiting_for_user",
  },
  {
    label: "Resolved",
    value: "resolved",
  },
  {
    label: "Closed",
    value: "closed",
  },
];

const categories: {
  label: string;
  value:
    | SupportCategory
    | "all";
}[] = [
  {
    label: "All Categories",
    value: "all",
  },
  {
    label: "Account",
    value: "account",
  },
  {
    label: "Authentication",
    value: "authentication",
  },
  {
    label: "Onboarding",
    value: "onboarding",
  },
  {
    label: "Dashboard",
    value: "dashboard",
  },
  {
    label: "Atlas",
    value: "atlas",
  },
  {
    label: "Missions",
    value: "missions",
  },
  {
    label: "Opportunities",
    value: "opportunities",
  },
  {
    label: "Progress",
    value: "progress",
  },
  {
    label: "Technical",
    value: "technical",
  },
  {
    label: "Billing",
    value: "billing",
  },
  {
    label: "Feedback",
    value: "feedback",
  },
  {
    label: "Other",
    value: "other",
  },
];

const urgencies: {
  label: string;
  value:
    | SupportUrgency
    | "all";
}[] = [
  {
    label: "All Priorities",
    value: "all",
  },
  {
    label: "Critical",
    value: "critical",
  },
  {
    label: "High",
    value: "high",
  },
  {
    label: "Normal",
    value: "normal",
  },
  {
    label: "Low",
    value: "low",
  },
];

const statusLabels: Record<
  SupportCaseStatus,
  string
> = {
  open: "Open",
  investigating: "Investigating",
  waiting_for_user:
    "Waiting for User",
  resolved: "Resolved",
  closed: "Closed",
};

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

function getStatusClasses(
  status: SupportCaseStatus
): string {
  switch (status) {
    case "investigating":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "waiting_for_user":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "resolved":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "closed":
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";

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

export default function SupportAdminPage() {
  const [
    cases,
    setCases,
  ] = useState<
    SupportCase[]
  >([]);

  const [
    selectedCaseId,
    setSelectedCaseId,
  ] = useState<
    string | null
  >(null);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    SupportCaseStatus | "all"
  >("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<
    SupportCategory | "all"
  >("all");

  const [
    urgencyFilter,
    setUrgencyFilter,
  ] = useState<
    SupportUrgency | "all"
  >("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    editedStatus,
    setEditedStatus,
  ] =
    useState<SupportCaseStatus>(
      "open"
    );

  const [
    assignedTo,
    setAssignedTo,
  ] = useState("");

  const [
    resolution,
    setResolution,
  ] = useState("");

  const selectedCase =
    useMemo(
      () =>
        cases.find(
          (supportCase) =>
            supportCase.id ===
            selectedCaseId
        ) ?? null,
      [
        cases,
        selectedCaseId,
      ]
    );

  const caseCounts =
    useMemo(
      () => ({
        total: cases.length,

        open:
          cases.filter(
            (supportCase) =>
              supportCase.status ===
              "open"
          ).length,

        active:
          cases.filter(
            (supportCase) =>
              supportCase.status ===
                "investigating" ||
              supportCase.status ===
                "waiting_for_user"
          ).length,

        resolved:
          cases.filter(
            (supportCase) =>
              supportCase.status ===
              "resolved"
          ).length,
      }),
      [cases]
    );

  const loadCases =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const query =
            new URLSearchParams({
              status:
                statusFilter,

              category:
                categoryFilter,

              urgency:
                urgencyFilter,

              limit: "200",
            });

          if (
            search.trim()
          ) {
            query.set(
              "search",
              search.trim()
            );
          }

          const response =
            await fetch(
              `/api/support/admin/cases?${query.toString()}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          const data =
            (await response.json()) as CasesResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.success
                ? "ASCEND could not load support cases."
                : data.error
            );
          }

          setCases(data.cases);

          setSelectedCaseId(
            (current) => {
              if (
                current &&
                data.cases.some(
                  (supportCase) =>
                    supportCase.id ===
                    current
                )
              ) {
                return current;
              }

              return (
                data.cases[0]
                  ?.id ?? null
              );
            }
          );
        } catch (error) {
          setCases([]);
          setSelectedCaseId(
            null
          );

          setError(
            error instanceof Error
              ? error.message
              : "ASCEND could not load support cases."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        statusFilter,
        categoryFilter,
        urgencyFilter,
        search,
      ]
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          loadCases();
        },
        search ? 350 : 0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadCases,
    search,
  ]);

  useEffect(() => {
    if (!selectedCase) {
      return;
    }

    setEditedStatus(
      selectedCase.status
    );

    setAssignedTo(
      selectedCase.assignedTo ??
        ""
    );

    setResolution(
      selectedCase.resolution ??
        ""
    );

    setSuccessMessage("");
  }, [selectedCase]);

  async function saveCase() {
    if (!selectedCase) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response =
        await fetch(
          "/api/support/admin/cases",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id:
                selectedCase.id,

              status:
                editedStatus,

              assignedTo:
                assignedTo.trim() ||
                null,

              resolution:
                resolution.trim() ||
                null,
            }),
          }
        );

      const data =
        (await response.json()) as UpdateResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.success
            ? "ASCEND could not update this case."
            : data.error
        );
      }

      setCases(
        (current) =>
          current.map(
            (supportCase) =>
              supportCase.id ===
              data.supportCase.id
                ? data.supportCase
                : supportCase
          )
      );

      setSuccessMessage(
        "Support case updated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ASCEND could not update this case."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05070B] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <ArrowLeft
                size={17}
              />

              Back to Support
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              ASCEND Operations
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Support Admin
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Investigate support cases, assign owners, communicate resolutions and track operational progress.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-3">
            <ShieldCheck
              size={21}
              className="text-cyan-300"
            />

            <div>
              <p className="text-sm font-semibold">
                Authorized Workspace
              </p>

              <p className="text-xs text-slate-500">
                Restricted support access
              </p>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <ClipboardList
              size={21}
              className="text-blue-300"
            />

            <p className="mt-5 text-3xl font-black">
              {
                caseCounts.total
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Cases loaded
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-5">
            <Inbox
              size={21}
              className="text-blue-300"
            />

            <p className="mt-5 text-3xl font-black">
              {
                caseCounts.open
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Open cases
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-5">
            <Clock3
              size={21}
              className="text-amber-300"
            />

            <p className="mt-5 text-3xl font-black">
              {
                caseCounts.active
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active investigations
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5">
            <CheckCircle2
              size={21}
              className="text-emerald-300"
            />

            <p className="mt-5 text-3xl font-black">
              {
                caseCounts.resolved
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Resolved cases
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(170px,0.35fr))_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search reference, title, email or issue..."
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/30"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value as
                    | SupportCaseStatus
                    | "all"
                )
              }
              className="h-12 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
            >
              {statuses.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            <select
              value={
                categoryFilter
              }
              onChange={(
                event
              ) =>
                setCategoryFilter(
                  event.target
                    .value as
                    | SupportCategory
                    | "all"
                )
              }
              className="h-12 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
            >
              {categories.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            <select
              value={
                urgencyFilter
              }
              onChange={(
                event
              ) =>
                setUrgencyFilter(
                  event.target
                    .value as
                    | SupportUrgency
                    | "all"
                )
              }
              className="h-12 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
            >
              {urgencies.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                loadCases
              }
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-5 text-rose-200">
            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm leading-6">
              {error}
            </p>
          </div>
        )}

        <section className="mt-6 grid min-h-[720px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] xl:grid-cols-[430px_minmax(0,1fr)]">
          <div className="border-b border-white/10 xl:border-b-0 xl:border-r">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-sm font-semibold">
                Support Cases
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {cases.length} case
                {cases.length ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            </div>

            <div className="max-h-[720px] overflow-y-auto">
              {loading &&
              cases.length ===
                0 ? (
                <div className="p-10 text-center">
                  <LoaderCircle
                    size={30}
                    className="mx-auto animate-spin text-cyan-300"
                  />

                  <p className="mt-4 text-sm text-slate-400">
                    Loading support cases...
                  </p>
                </div>
              ) : cases.length ===
                0 ? (
                <div className="p-10 text-center">
                  <Inbox
                    size={32}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-4 font-semibold">
                    No cases found
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Try changing the active filters.
                  </p>
                </div>
              ) : (
                cases.map(
                  (
                    supportCase
                  ) => {
                    const active =
                      supportCase.id ===
                      selectedCaseId;

                    return (
                      <button
                        key={
                          supportCase.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedCaseId(
                            supportCase.id
                          )
                        }
                        className={`w-full border-b border-white/[0.07] p-5 text-left transition ${
                          active
                            ? "bg-cyan-400/[0.08]"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-semibold text-cyan-300">
                            {
                              supportCase.referenceNumber
                            }
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getUrgencyClasses(
                              supportCase.urgency
                            )}`}
                          >
                            {
                              supportCase.urgency
                            }
                          </span>
                        </div>

                        <h3 className="mt-3 line-clamp-2 font-semibold leading-6">
                          {
                            supportCase.title
                          }
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {
                            supportCase.initialMessage
                          }
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
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

                          <span className="text-[11px] text-slate-600">
                            {formatDate(
                              supportCase.createdAt
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </div>

          <div className="min-w-0">
            {!selectedCase ? (
              <div className="flex min-h-[720px] items-center justify-center p-8 text-center">
                <div>
                  <ClipboardList
                    size={40}
                    className="mx-auto text-slate-700"
                  />

                  <h2 className="mt-5 text-xl font-semibold">
                    Select a support case
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Choose a case to investigate and update.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                      {
                        selectedCase.referenceNumber
                      }
                    </p>

                    <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                      {
                        selectedCase.title
                      }
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                        selectedCase.status
                      )}`}
                    >
                      {
                        statusLabels[
                          selectedCase
                            .status
                        ]
                      }
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getUrgencyClasses(
                        selectedCase.urgency
                      )}`}
                    >
                      {
                        selectedCase.urgency
                      }{" "}
                      priority
                    </span>
                  </div>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
                      Category
                    </p>

                    <p className="mt-2 capitalize text-sm font-medium">
                      {
                        selectedCase.category
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
                      Created
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {formatDate(
                        selectedCase.createdAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
                      Last Updated
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {formatDate(
                        selectedCase.updatedAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <h3 className="font-semibold">
                    Reported Issue
                  </h3>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {
                      selectedCase.initialMessage
                    }
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <h3 className="font-semibold">
                    Support Diagnosis
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {
                      selectedCase.diagnosis
                        .summary
                    }
                  </p>

                  {selectedCase
                    .diagnosis
                    .possibleCauses
                    .length >
                    0 && (
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
                        Possible Causes
                      </p>

                      <ul className="mt-3 space-y-2">
                        {selectedCase.diagnosis.possibleCauses.map(
                          (
                            cause,
                            index
                          ) => (
                            <li
                              key={`${cause}-${index}`}
                              className="flex gap-3 text-sm leading-6 text-slate-400"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

                              {cause}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <div>
                    <label
                      htmlFor="case-status"
                      className="text-sm font-medium text-slate-300"
                    >
                      Case Status
                    </label>

                    <select
                      id="case-status"
                      value={
                        editedStatus
                      }
                      onChange={(
                        event
                      ) =>
                        setEditedStatus(
                          event.target
                            .value as SupportCaseStatus
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-400/30"
                    >
                      {statuses
                        .filter(
                          (
                            option
                          ) =>
                            option.value !==
                            "all"
                        )
                        .map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="assigned-to"
                      className="text-sm font-medium text-slate-300"
                    >
                      Assigned To
                    </label>

                    <div className="relative mt-2">
                      <UserRound
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        id="assigned-to"
                        value={
                          assignedTo
                        }
                        onChange={(
                          event
                        ) =>
                          setAssignedTo(
                            event.target
                              .value
                          )
                        }
                        placeholder="Support agent name"
                        className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="resolution"
                    className="text-sm font-medium text-slate-300"
                  >
                    Resolution or Support Update
                  </label>

                  <textarea
                    id="resolution"
                    value={
                      resolution
                    }
                    onChange={(
                      event
                    ) =>
                      setResolution(
                        event.target
                          .value
                      )
                    }
                    placeholder="Explain what was investigated, what was changed, or what the user should do next..."
                    className="mt-2 min-h-40 w-full resize-y rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                  />
                </div>

                {successMessage && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-200">
                    <CheckCircle2
                      size={18}
                    />

                    {
                      successMessage
                    }
                  </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Link
                    href={`/support/cases/${encodeURIComponent(
                      selectedCase.referenceNumber
                    )}`}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Open User View
                  </Link>

                  <button
                    type="button"
                    onClick={
                      saveCase
                    }
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={18}
                      />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Case"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}