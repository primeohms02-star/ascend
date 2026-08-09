"use client";

export default function ReflectionCard() {
  return (
    <section className="h-52 rounded-3xl border border-white/10 bg-white/5 p-8">

      <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
        Reflection
      </p>

      <h2 className="mt-3 text-2xl font-bold text-white">
        Today's Thought
      </h2>

      <blockquote className="mt-6 border-l-2 border-blue-500 pl-4 text-slate-300 italic leading-7">
        "Small consistent actions become extraordinary results."
      </blockquote>

      <button className="mt-8 rounded-xl border border-white/10 px-5 py-3 text-white transition hover:bg-white/10">
        Open Journal →
      </button>

    </section>
  );
}