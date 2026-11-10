import { supabaseAdmin } from "@/lib/supabase-admin";
export default async function JourneyHistory({ userId }: { userId: string }) {
  const [updates, evidence] = await Promise.all([
    supabaseAdmin
      .from("atlas_journey_updates")
      .select("id,event,step,note,recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(20)
      .abortSignal(AbortSignal.timeout(5000)),
    supabaseAdmin
      .from("ascend_project_evidence")
      .select(
        "id,title,summary,deliverable_preview,evidence_status,verified_by,created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .abortSignal(AbortSignal.timeout(5000)),
  ]);
  return (
    <section className="mt-5 rounded-2xl border border-cyan-400/20 bg-slate-900 p-5">
      <h2 className="font-bold text-white">Your recent progress</h2>
      {updates.error ? (
        <p>Updates could not load.</p>
      ) : updates.data.length ? (
        updates.data.map((x) => (
          <p className="mt-2 text-sm text-slate-300" key={x.id}>
            <strong>{x.step}</strong> · {x.note || "Step chosen"}
          </p>
        ))
      ) : (
        <p className="mt-2 text-slate-400">
          Your first check-in will appear here.
        </p>
      )}
      {evidence.error ? (
        <p className="mt-3 text-xs text-slate-400">Past work could not load.</p>
      ) : (
        evidence.data.length > 0 && (
          <details className="mt-4 text-sm text-slate-300">
            <summary>Previously completed work (latest 20)</summary>
            {evidence.data.map((x) => (
              <details className="mt-3" key={x.id}>
                <summary>{x.title}</summary>
                <p>
                  {x.evidence_status === "verified" && x.verified_by
                    ? "Human reviewed"
                    : "Recorded completion"}
                </p>
                <p>{x.summary}</p>
                {Object.entries(x.deliverable_preview ?? {}).map(
                  ([label, value]) =>
                    typeof value === "string" && value.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap" key={label}>
                        <strong>{label}: </strong>
                        {value}
                      </p>
                    ) : null,
                )}
              </details>
            ))}
          </details>
        )
      )}
    </section>
  );
}
