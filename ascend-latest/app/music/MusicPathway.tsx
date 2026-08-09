"use client";

import { useState } from "react";

import Link from "next/link";
import PreviousPageButton from "@/app/components/navigation/PreviousPageButton";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Headphones,
  LoaderCircle,
  MapPin,
  Music2,
  Pencil,
  Radio,
  Sparkles,
  Target,
} from "lucide-react";

import {
  MUSIC_CHALLENGES,
  MUSIC_GENRES,
  MUSIC_GOALS,
  MUSIC_REGIONS,
  MUSIC_ROLES,
  MUSIC_SKILLS,
  MUSIC_STAGES,
  type MusicProfile,
  type MusicProfileInput,
} from "@/lib/music/types";

type Props = {
  initialProfile: MusicProfile | null;
};

const emptyProfile: MusicProfileInput = {
  roles: [],
  careerStage: "",
  genres: [],
  skills: [],
  goal: "",
  challenges: [],
  location: "Nigeria",
  preferredRegions: ["Nigeria", "Africa"],
  northStar: "",
};

function toInput(profile: MusicProfile): MusicProfileInput {
  return {
    roles: profile.roles,
    careerStage: profile.careerStage,
    genres: profile.genres,
    skills: profile.skills,
    goal: profile.goal,
    challenges: profile.challenges,
    location: profile.location,
    preferredRegions: profile.preferredRegions,
    northStar: profile.northStar,
  };
}

function toggleValue(values: string[], value: string, maximum: number) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return values.length < maximum ? [...values, value] : values;
}

function ChoiceGroup({
  label,
  description,
  options,
  values,
  maximum,
  onChange,
}: {
  label: string;
  description: string;
  options: readonly string[];
  values: string[];
  maximum: number;
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold text-white">{label}</legend>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {options.map((option) => {
          const active = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(toggleValue(values, option, maximum))}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-fuchsia-300/50 bg-fuchsia-400/15 text-fuchsia-100"
                  : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-fuchsia-300/30 hover:text-white"
              }`}
            >
              {active && <Check size={14} className="mr-1.5 inline" />}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function MusicPathway({ initialProfile }: Props) {
  const [profile, setProfile] = useState<MusicProfile | null>(initialProfile);
  const [form, setForm] = useState<MusicProfileInput>(
    initialProfile ? toInput(initialProfile) : emptyProfile
  );
  const [editing, setEditing] = useState(!initialProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<Key extends keyof MusicProfileInput>(
    key: Key,
    value: MusicProfileInput[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setError("");

    if (
      form.roles.length === 0 ||
      !form.careerStage ||
      form.genres.length === 0 ||
      !form.goal ||
      form.challenges.length === 0 ||
      form.preferredRegions.length === 0 ||
      form.location.trim().length < 2 ||
      form.northStar.trim().length < 20
    ) {
      setError("Complete every required Music Pathway section before saving.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/music/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.profile) {
        throw new Error(data.error ?? "ASCEND Music could not save your pathway.");
      }

      setProfile(data.profile as MusicProfile);
      setForm(toInput(data.profile as MusicProfile));
      setEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ASCEND Music could not save your pathway."
      );
    } finally {
      setSaving(false);
    }
  }

  if (profile && !editing) {
    return (
      <main className="min-h-screen bg-[#05060A] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PreviousPageButton
              fallbackHref="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={17} /> Back
            </PreviousPageButton>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/15"
            >
              <Pencil size={16} /> Update Pathway
            </button>
          </div>

          <header className="relative mt-10 overflow-hidden rounded-[2rem] border border-fuchsia-300/15 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/[0.06] to-slate-950 p-7 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
                <Music2 size={28} />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200">ASCEND Music Pathway</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{profile.northStar}</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
                Your music direction now gives Atlas and the Opportunity Engine a clearer understanding of what you are building.
              </p>
            </div>
          </header>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <Headphones className="text-fuchsia-300" size={24} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Music identity</p>
              <h2 className="mt-2 text-xl font-semibold">{profile.roles.join(" · ")}</h2>
              <p className="mt-2 text-sm text-slate-400">{profile.careerStage} stage</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.genres.map((genre) => (
                  <span key={genre} className="rounded-full bg-fuchsia-400/10 px-3 py-1.5 text-xs text-fuchsia-200">{genre}</span>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <Target className="text-cyan-300" size={24} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current goal</p>
              <h2 className="mt-2 text-xl font-semibold">{profile.goal}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">Atlas will use this as supporting context without replacing your active ASCEND mission.</p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <Sparkles className="text-amber-300" size={24} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Strengths and readiness</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.length > 0 ? profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-3 py-1.5 text-xs text-amber-100">{skill}</span>
                )) : <p className="text-sm text-slate-400">Skills are still being developed.</p>}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">Focus gaps: {profile.challenges.join(", ")}</p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <MapPin className="text-emerald-300" size={24} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Opportunity direction</p>
              <h2 className="mt-2 text-xl font-semibold">{profile.location}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Priority regions: {profile.preferredRegions.join(", ")}</p>
            </section>
          </div>

          <section className="mt-6 grid gap-4 rounded-3xl border border-fuchsia-300/15 bg-fuchsia-400/[0.055] p-6 sm:grid-cols-2">
            <Link href="/opportunities" className="group rounded-2xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-fuchsia-300/30">
              <Radio className="text-fuchsia-300" size={23} />
              <h2 className="mt-4 font-semibold">Explore Opportunities</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Discover opportunities ranked with your music direction as an additional signal.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-200">Open Radar <ArrowRight size={16} /></span>
            </Link>

            <Link href="/atlas" className="group rounded-2xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-cyan-300/30">
              <Compass className="text-cyan-300" size={23} />
              <h2 className="mt-4 font-semibold">Talk with Atlas</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Plan your next music move using your pathway, current direction and real ASCEND context.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Open Atlas <ArrowRight size={16} /></span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05060A] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <PreviousPageButton
          fallbackHref="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} /> Back
        </PreviousPageButton>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">ASCEND Music</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Build your Music Pathway</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Define your music identity, direction and opportunity focus. This adds context to ASCEND without changing your active mission or XP.</p>
        </header>

        <div className="mt-10 space-y-9 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-9">
          <ChoiceGroup label="What roles describe you?" description="Select every role that genuinely represents your music work." options={MUSIC_ROLES} values={form.roles} maximum={8} onChange={(values) => update("roles", values)} />

          <div>
            <label htmlFor="music-stage" className="text-lg font-semibold">Where are you in your journey?</label>
            <select id="music-stage" value={form.careerStage} onChange={(event) => update("careerStage", event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-slate-200 outline-none focus:border-fuchsia-300/40">
              <option value="">Select your stage</option>
              {MUSIC_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </div>

          <ChoiceGroup label="Which genres shape your work?" description="Choose the scenes and sounds most relevant to your direction." options={MUSIC_GENRES} values={form.genres} maximum={12} onChange={(values) => update("genres", values)} />
          <ChoiceGroup label="What can you already do?" description="Skills are used to separate realistic matches from genuine growth areas." options={MUSIC_SKILLS} values={form.skills} maximum={20} onChange={(values) => update("skills", values)} />

          <div>
            <label htmlFor="music-goal" className="text-lg font-semibold">What is your immediate music goal?</label>
            <select id="music-goal" value={form.goal} onChange={(event) => update("goal", event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-slate-200 outline-none focus:border-fuchsia-300/40">
              <option value="">Select your goal</option>
              {MUSIC_GOALS.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
            </select>
          </div>

          <ChoiceGroup label="What is making progress difficult?" description="Select the barriers ASCEND should understand." options={MUSIC_CHALLENGES} values={form.challenges} maximum={10} onChange={(values) => update("challenges", values)} />

          <div>
            <label htmlFor="music-location" className="text-lg font-semibold">Where are you based?</label>
            <input id="music-location" value={form.location} onChange={(event) => update("location", event.target.value)} maxLength={100} placeholder="Lagos, Nigeria" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-fuchsia-300/40" />
          </div>

          <ChoiceGroup label="Where should ASCEND look?" description="Nigeria and Africa are prioritized while global paths remain available." options={MUSIC_REGIONS} values={form.preferredRegions} maximum={6} onChange={(values) => update("preferredRegions", values)} />

          <div>
            <label htmlFor="music-north-star" className="text-lg font-semibold">What future are you building through music?</label>
            <p className="mt-1 text-sm leading-6 text-slate-400">Write your Music North Star in your own words.</p>
            <textarea id="music-north-star" value={form.northStar} onChange={(event) => update("northStar", event.target.value)} minLength={20} maxLength={1200} rows={6} placeholder="I am building..." className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-fuchsia-300/40" />
            <p className="mt-2 text-right text-xs text-slate-600">{form.northStar.trim().length}/1200</p>
          </div>

          {error && <p role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-4 text-sm text-rose-200">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {profile && <button type="button" onClick={() => { setForm(toInput(profile)); setEditing(false); setError(""); }} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5">Cancel</button>}
            <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <><LoaderCircle size={18} className="animate-spin" /> Saving Pathway...</> : <>Build My Music Pathway <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
