"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  activeStep,
  type JourneyState,
  type JourneyEvent,
} from "@/lib/guidance/types";
import type { Pick } from "@/lib/guidance/opportunities";
import { draftKey, readStepDraft } from "@/lib/guidance/draft";
const panel =
  "mt-4 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] p-5 sm:p-6";
const button =
  "inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50";
const secondary =
  "inline-flex rounded-xl border border-white/15 px-3 py-2 text-sm text-cyan-200 disabled:opacity-50";
const field =
  "mt-2 w-full rounded-xl border border-white/15 bg-slate-950/60 p-3 text-sm text-white";
export default function AtlasJourney({ userId }: { userId: string }) {
  const [state, setJourney] = useState<JourneyState | null>(null),
    [draft, setDraft] = useState(""),
    [why, setReason] = useState(""),
    [edit, setEditing] = useState(false),
    [note, setNote] = useState(""),
    [event, setEvent] = useState<JourneyEvent>("tried"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [revision, setReload] = useState(0);
  const lock = useRef(false);
  const key = draftKey(userId);
  function clearDraft() {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* Storage may be disabled. */
    }
  }
  function editDraft(step: string, reason: string) {
    setDraft(step);
    setReason(reason);
    setEditing(true);
    if (state)
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            direction: state.direction,
            previous: state.history[0]?.id ?? null,
            step,
            why: reason,
          }),
        );
      } catch {
        setError(
          "Your browser cannot keep this draft through a refresh. Save it before leaving.",
        );
      }
  }
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/guidance", { cache: "no-store", signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw Error("Your next step could not load.");
        return r.json();
      })
      .then((x) => {
        if (!ctrl.signal.aborted) {
          let restored = null;
          try {
            restored = readStepDraft(sessionStorage.getItem(key), x);
            if (!restored) sessionStorage.removeItem(key);
          } catch {
            /* The journey still works without browser storage. */
          }
          setDraft(restored?.step ?? "");
          setReason(restored?.why ?? "");
          setEditing(Boolean(restored));
          setJourney(x);
          setError("");
        }
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(e.message);
      });
    return () => ctrl.abort();
  }, [revision, key]);
  const current = state ? activeStep(state.history) : null;
  const reached = state?.history[0]?.event === "achieved";
  async function action(kind: JourneyEvent | "suggest") {
    if (!state || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: kind,
          id: crypto.randomUUID(),
          previous: state.history[0]?.id ?? null,
          direction: state.direction,
          step: kind === "accept" ? draft : (current ?? state.history[0]?.step),
          note: kind === "accept" ? "" : note,
        }),
      });
      const value = await r.json();
      if (!r.ok) throw Error(value.error || "Please try again.");
      if (kind === "suggest") {
        editDraft(value.step, value.why);
      } else {
        clearDraft();
        const next = await fetch("/api/guidance", { cache: "no-store" });
        if (!next.ok) throw Error("Update saved. Refresh to load it.");
        setJourney(await next.json());
        setDraft("");
        setNote("");
        setReason("");
        setEditing(false);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save. Refresh and try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className={panel}>
      <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
        Atlas · Your next step
      </p>
      {!state ? (
        <p role="status" className="mt-3 text-slate-300">
          {error || "Loading your journey…"}
        </p>
      ) : (
        <>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {reached
              ? "You reached this goal"
              : current || "What would move you closer to your goal?"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Your direction:{" "}
            {state.direction || "Set a direction in onboarding."}
          </p>
          {reached ? (
            <div className="mt-3">
              <p className="text-slate-300">{state.history[0].note}</p>
              <Link className={secondary} href="/onboarding">
                Choose a new direction
              </Link>
            </div>
          ) : current && !edit ? (
            <div className="mt-4">
              <label className="text-sm text-slate-300">
                How did it go?{" "}
                <select
                  value={event}
                  onChange={(e) => setEvent(e.target.value as JourneyEvent)}
                  className="rounded-lg bg-slate-900 p-2"
                >
                  <option value="tried">I tried it</option>
                  <option value="stuck">I’m stuck</option>
                  <option value="done">I finished this step</option>
                  <option value="achieved">I reached my overall goal</option>
                </select>
              </label>
              <label className="block mt-3 text-sm text-slate-300">
                What happened?
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1500}
                  className={field}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={button}
                  disabled={busy || !note.trim()}
                  onClick={() => action(event)}
                >
                  Save update
                </button>
                <button
                  className={secondary}
                  disabled={busy}
                  onClick={() => {
                    editDraft(current, "");
                  }}
                >
                  Adjust my step
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {!edit ? (
                <div className="flex gap-2 flex-wrap">
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => action("suggest")}
                  >
                    {busy ? "Thinking…" : "Suggest a next step"}
                  </button>
                  <button
                    className={secondary}
                    disabled={busy}
                    onClick={() => editDraft("", "")}
                  >
                    Write my own
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-xs font-semibold text-cyan-300">
                    Draft · Not yet your active step
                  </p>
                  <p className="text-sm text-cyan-200">{why}</p>
                  <label className="block mt-2 text-sm text-slate-300">
                    Review or change your next step
                    <textarea
                      className={field}
                      maxLength={600}
                      value={draft}
                      onChange={(e) => editDraft(e.target.value, why)}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      className={button}
                      disabled={busy || !draft.trim()}
                      onClick={() => action("accept")}
                    >
                      {busy ? "Please wait…" : "Save as my next step"}
                    </button>
                    <button
                      className={secondary}
                      disabled={busy}
                      onClick={() => action("suggest")}
                    >
                      Ask Atlas for another idea
                    </button>
                    <button
                      className={secondary}
                      disabled={busy}
                      onClick={() => {
                        clearDraft();
                        setEditing(false);
                        setDraft("");
                        setReason("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {!reached &&
            !current &&
            !edit &&
            state.history[0]?.event === "done" && (
              <details className="mt-4 text-sm text-slate-300">
                <summary>Reached your overall goal?</summary>
                <label>
                  What tells you that you reached it?
                  <textarea
                    className={field}
                    maxLength={1500}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                <button
                  className={secondary}
                  disabled={busy || !note.trim()}
                  onClick={() => action("achieved")}
                >
                  Record goal achieved
                </button>
              </details>
            )}
          {state.history.length > 0 && (
            <details className="mt-4 text-sm text-slate-300">
              <summary className="cursor-pointer">Recent progress</summary>
              {state.history.map((x) => (
                <p key={x.id} className="mt-2">
                  <strong>
                    {
                      {
                        accept: "Chose a step",
                        tried: "Tried it",
                        stuck: "Asked for help",
                        done: "Finished step",
                        achieved: "Reached goal",
                      }[x.event]
                    }
                  </strong>{" "}
                  · {x.note || x.step}
                </p>
              ))}
            </details>
          )}
          <Link
            href="/atlas"
            className="mt-4 inline-block text-sm text-cyan-300"
          >
            Talk it through with Atlas →
          </Link>{" "}
          <Link className="ml-3 text-sm text-slate-400" href="/onboarding">
            Change direction
          </Link>
        </>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-amber-200">
          {state ? error : ""}{" "}
          <button className={secondary} onClick={() => setReload((r) => r + 1)}>
            Reload
          </button>
        </p>
      )}
    </section>
  );
}
export function OpportunityPicks() {
  const [hideError, setHideError] = useState(""),
    [hiding, setHiding] = useState("");
  async function hide(id: string) {
    setHiding(id);
    setHideError("");
    try {
      const r = await fetch("/api/guidance/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw Error();
      setPicks((prev) => prev?.filter((x) => x.id !== id) ?? null);
    } catch {
      setHideError("Could not hide this listing. Please retry.");
    } finally {
      setHiding("");
    }
  }

  const [items, setPicks] = useState<Pick[] | null>(null),
    [error, setError] = useState(false),
    [rev, setReload] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/guidance/opportunities", {
      signal: AbortSignal.any([c.signal, AbortSignal.timeout(18000)]),
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((x) => {
        if (!c.signal.aborted) setPicks(x.picks);
      })
      .catch(() => {
        if (!c.signal.aborted) setError(true);
      });
    return () => c.abort();
  }, [rev]);
  return (
    <section className={panel}>
      <h2 className="text-lg font-bold text-white">
        Opportunities for your direction
      </h2>
      {hideError && (
        <p role="alert" className="text-sm text-amber-300">
          {hideError}
        </p>
      )}
      {error ? (
        <button
          className={secondary}
          onClick={() => {
            setError(false);
            setPicks(null);
            setReload((r) => r + 1);
          }}
        >
          Couldn’t load matches · Retry
        </button>
      ) : !items ? (
        <p className="mt-2 text-slate-400">Checking your matches…</p>
      ) : items.length ? (
        items.map((p) => (
          <article
            key={p.id}
            className="mt-3 rounded-xl border border-white/10 p-4"
          >
            <h3 className="font-semibold text-white">{p.title}</h3>
            <p className="text-xs text-slate-400">
              {p.company} · {p.source} · Deadline: {p.deadline}
            </p>
            <p className="mt-2 text-sm text-slate-300">{p.reason}</p>
            <p className="mt-1 text-sm text-slate-400">{p.gap}</p>
            <div className="mt-3 flex gap-4">
              <Link className="text-sm text-cyan-300" href={p.href}>
                Assess fit with Atlas
              </Link>
              <a
                className="text-sm text-cyan-300"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Original listing ↗
              </a>
              <button
                className="text-sm text-slate-400"
                disabled={!!hiding}
                onClick={() => hide(p.id)}
              >
                Not relevant
              </button>
            </div>
          </article>
        ))
      ) : (
        <p className="mt-2 text-slate-400">
          No new listings closely match your direction right now.
        </p>
      )}
      <Link
        className="mt-4 inline-block text-sm text-cyan-300"
        href="/opportunities"
      >
        See more in Explore →
      </Link>
    </section>
  );
}
