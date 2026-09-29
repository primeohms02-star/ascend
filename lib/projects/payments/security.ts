import { createHmac, timingSafeEqual } from "node:crypto";

function sameValue(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyFlutterwaveWebhook(rawBody: string, headers: Headers, secretHash: string) {
  if (!secretHash) return false;
  const signature = headers.get("flutterwave-signature");
  if (signature) {
    const digest = createHmac("sha256", secretHash).update(rawBody).digest("base64");
    return sameValue(signature, digest);
  }
  const legacy = headers.get("verif-hash");
  return Boolean(legacy && sameValue(legacy, secretHash));
}

export function projectTransferReference(deliveryId: string) {
  return `ascend-project-${deliveryId}`.slice(0, 100);
}

export function mapFlutterwaveTransferStatus(status: unknown) {
  const value = String(status ?? "").toUpperCase();
  if (["SUCCESSFUL", "SUCCESS", "COMPLETED"].includes(value)) return "delivered" as const;
  if (["FAILED", "CANCELLED"].includes(value)) return "issue_reported" as const;
  return "processing" as const;
}
