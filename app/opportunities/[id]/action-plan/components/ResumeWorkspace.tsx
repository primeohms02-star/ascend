"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FileText, Sparkles } from "lucide-react";

import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";

type ResumeDraft = {
  fullName: string;
  contact: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
};

type SectionKey = keyof ResumeDraft;

type Props = {
  opportunityId: string;
  opportunityTitle: string;
  company: string;
};

const emptyDraft: ResumeDraft = {
  fullName: "",
  contact: "",
  summary: "",
  experience: "",
  education: "",
  skills: "",
  projects: "",
};

const sections: Array<{
  key: SectionKey;
  label: string;
  hint: string;
  multiline?: boolean;
}> = [
  {
    key: "fullName",
    label: "Name and headline",
    hint: "Your name plus a concise professional or project-focused headline.",
  },
  {
    key: "contact",
    label: "Contact and links",
    hint: "Email, phone, location, LinkedIn, portfolio or other relevant links.",
    multiline: true,
  },
  {
    key: "summary",
    label: "Professional summary",
    hint: "A short summary tailored to the opportunity and the value you can provide.",
    multiline: true,
  },
  {
    key: "experience",
    label: "Experience and achievements",
    hint: "Roles, responsibilities and measurable outcomes that show evidence of your ability.",
    multiline: true,
  },
  {
    key: "education",
    label: "Education and credentials",
    hint: "Relevant education, certifications, programmes or training.",
    multiline: true,
  },
  {
    key: "skills",
    label: "Relevant skills",
    hint: "Only skills you can genuinely support with evidence.",
    multiline: true,
  },
  {
    key: "projects",
    label: "Projects and proof",
    hint: "Projects, case studies, portfolio work, awards or other proof relevant to the opportunity.",
    multiline: true,
  },
];

export default function ResumeWorkspace({
  opportunityId,
  opportunityTitle,
  company,
}: Props) {
  const storageKey = `ascend-resume-workspace:${opportunityId}`;
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);
  const [completed, setCompleted] = useState<Set<SectionKey>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);

        if (saved) {
          const parsed = JSON.parse(saved) as {
            draft?: Partial<ResumeDraft>;
            completed?: SectionKey[];
          };

          setDraft({ ...emptyDraft, ...(parsed.draft ?? {}) });
          setCompleted(new Set(Array.isArray(parsed.completed) ? parsed.completed : []));
        }
      } catch {
        setDraft(emptyDraft);
        setCompleted(new Set());
      } finally {
        setLoaded(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ draft, completed: [...completed] })
      );
    } catch {
      // The workspace remains usable if local storage is unavailable.
    }
  }, [completed, draft, loaded, storageKey]);

  const completionPercent = Math.round((completed.size / sections.length) * 100);

  const atlasContext = useMemo(() => {

    const draftSummary = [
      draft.fullName && `Name/headline: ${draft.fullName}`,
      draft.contact && `Contact/links: ${draft.contact}`,
      draft.summary && `Summary: ${draft.summary}`,
      draft.experience && `Experience: ${draft.experience}`,
      draft.education && `Education: ${draft.education}`,
      draft.skills && `Skills: ${draft.skills}`,
      draft.projects && `Projects/proof: ${draft.projects}`,
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 1500);

    return `Resume Builder inside an Atlas Action Plan. Target opportunity: ${opportunityTitle}. Organisation: ${company}. The user is actively drafting their resume for this application.${draftSummary ? ` Current draft:\n${draftSummary}` : ""}`;
  }, [company, draft, opportunityTitle]);

  function updateField(key: SectionKey, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleSection(key: SectionKey) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <section className="rounded-3xl border border-blue-400/18 bg-blue-400/[0.04] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <FileText size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Resume Builder</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Build the resume here</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Draft each section, tick it off when you are satisfied, and keep a clean working version tied to this opportunity.
            </p>
          </div>
        </div>

        <ContextualAtlasLink
          prompt={`Help me improve my resume for the ${opportunityTitle} opportunity at ${company}.`}
          context={atlasContext}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300/35"
        >
          <Sparkles size={16} aria-hidden="true" />
          Ask Atlas
        </ContextualAtlasLink>
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-slate-950/35 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-300">Resume completion</span>
          <span className="text-sm font-semibold text-blue-300">{completionPercent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-[width] duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {sections.map((section) => {
          const isComplete = completed.has(section.key);

          return (
            <div
              key={section.key}
              className={`rounded-2xl border p-4 ${
                isComplete
                  ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                  : "border-white/[0.08] bg-slate-950/35"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  aria-pressed={isComplete}
                  aria-label={`${isComplete ? "Mark incomplete" : "Mark complete"}: ${section.label}`}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                    isComplete
                      ? "border-emerald-400 bg-emerald-400 text-slate-950"
                      : "border-slate-600 bg-slate-900 text-transparent hover:border-blue-400"
                  }`}
                >
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </button>

                <div className="min-w-0 flex-1">
                  <label htmlFor={`resume-${section.key}`} className="text-sm font-semibold text-white">
                    {section.label}
                  </label>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{section.hint}</p>

                  {section.multiline ? (
                    <textarea
                      id={`resume-${section.key}`}
                      value={draft[section.key]}
                      onChange={(event) => updateField(section.key, event.target.value)}
                      rows={section.key === "experience" ? 6 : 4}
                      className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-[#060A11] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/45"
                      placeholder={`Write your ${section.label.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      id={`resume-${section.key}`}
                      value={draft[section.key]}
                      onChange={(event) => updateField(section.key, event.target.value)}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-[#060A11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/45"
                      placeholder={`Write your ${section.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#060A11] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-white">Resume preview</h3>
          <span className="text-xs text-slate-600">Saved on this device</span>
        </div>

        <div className="mt-4 space-y-5 text-sm leading-6 text-slate-300">
          {draft.fullName ? <h4 className="text-xl font-bold text-white">{draft.fullName}</h4> : null}
          {draft.contact ? <p className="whitespace-pre-line text-slate-400">{draft.contact}</p> : null}
          {draft.summary ? <PreviewSection title="Summary" value={draft.summary} /> : null}
          {draft.experience ? <PreviewSection title="Experience" value={draft.experience} /> : null}
          {draft.education ? <PreviewSection title="Education" value={draft.education} /> : null}
          {draft.skills ? <PreviewSection title="Skills" value={draft.skills} /> : null}
          {draft.projects ? <PreviewSection title="Projects and proof" value={draft.projects} /> : null}

          {!Object.values(draft).some((value) => value.trim()) && (
            <p className="text-slate-600">Your resume preview will appear here as you add content.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function PreviewSection({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h5 className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">{title}</h5>
      <p className="mt-1.5 whitespace-pre-line">{value}</p>
    </section>
  );
}
