export function isProjectEvidenceId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
export function buildEvidenceContext(evidence: {title:string;deliverable_preview:unknown;evidence_status:string;verified_by?:string|null}) {
  const entries = evidence.deliverable_preview && typeof evidence.deliverable_preview === "object" && !Array.isArray(evidence.deliverable_preview)
    ? Object.entries(evidence.deliverable_preview).filter((entry):entry is [string,string]=>typeof entry[1] === "string" && !!entry[1].trim()) : [];
  return JSON.stringify({
    title:evidence.title.slice(0,240), type:"Independent learning project, not employment",
    review: evidence.evidence_status === "verified" && evidence.verified_by ? "Human reviewed" : "Completed; not human reviewed",
    limitation:"Student-authored evidence, not independent verification of claims. Excerpts may omit details. No linked files were opened.",
    milestones:entries.slice(0,8).map(([title,text])=>({title:title.slice(0,160),text:text.slice(0,900),truncated:text.length>900})),
    omittedMilestones:Math.max(0,entries.length-8),
  });
}
