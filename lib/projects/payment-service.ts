import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { projectErrorFromDatabase, ProjectServiceError } from "./errors";
import { getPaymentConfig } from "./payments/config";
import { initiateTransfer, listNigerianBanks, retrieveTransfer, verifyAndCreateBeneficiary } from "./payments/flutterwave";
import { mapFlutterwaveTransferStatus, projectTransferReference } from "./payments/security";

async function auditPayout(input: { deliveryId: string; actorUserId?: string; eventType: string; fromStatus?: string | null; toStatus: string; metadata?: Record<string, unknown> }) {
  const delivery = await supabaseAdmin.from("ascend_project_reward_deliveries").select("participation_id,ascend_project_rewards!inner(project_id)").eq("id", input.deliveryId).single();
  if (delivery.error) return;
  const reward = delivery.data.ascend_project_rewards as unknown as { project_id: string };
  await supabaseAdmin.from("ascend_project_audit_events").insert({ project_id: reward.project_id, participation_id: delivery.data.participation_id, actor_user_id: input.actorUserId ?? null, actor_type: input.actorUserId ? "admin" : "system", event_type: input.eventType, from_status: input.fromStatus ?? null, to_status: input.toStatus, metadata: { delivery_id: input.deliveryId, ...(input.metadata ?? {}) } });
}

export async function paymentReadiness() {
  const config = getPaymentConfig();
  return { provider: config.provider, mode: config.mode, enabled: config.enabled, configured: Boolean(config.secretKey), live: false };
}
export async function getBanks() { return { banks: await listNigerianBanks() }; }

export async function getPaymentProfile(userId: string) {
  const result = await supabaseAdmin.from("ascend_project_payment_profiles").select("provider,bank_code,bank_name,account_name,account_last4,currency,verification_status,verified_at").eq("user_id", userId).maybeSingle();
  if (result.error) throw projectErrorFromDatabase(result.error);
  return result.data;
}

export async function savePaymentProfile(userId: string, input: Record<string, unknown>) {
  const accountNumber = String(input.accountNumber ?? "").replace(/\s/g, "");
  const bankCode = String(input.bankCode ?? "").trim();
  const bankName = String(input.bankName ?? "").trim().slice(0, 160);
  if (!/^\d{10}$/.test(accountNumber) || !bankCode || bankName.length < 2) throw new ProjectServiceError("INVALID_REQUEST", "Choose a bank and enter a valid 10-digit Nigerian account number.", 400);
  const verified = await verifyAndCreateBeneficiary({ accountNumber, bankCode, bankName });
  const result = await supabaseAdmin.from("ascend_project_payment_profiles").upsert({ user_id: userId, provider: "flutterwave", provider_beneficiary_id: verified.providerBeneficiaryId, bank_code: verified.bankCode, bank_name: verified.bankName, account_name: verified.accountName, account_last4: verified.accountLast4, currency: verified.currency, verification_status: "verified", verified_at: new Date().toISOString() }, { onConflict: "user_id" }).select("provider,bank_code,bank_name,account_name,account_last4,currency,verification_status,verified_at").single();
  if (result.error) throw projectErrorFromDatabase(result.error);
  return result.data;
}

export async function initiateRewardPayout(deliveryId: string, adminId: string) {
  const result = await supabaseAdmin.from("ascend_project_reward_deliveries").select("id,participation_id,user_id,amount_minor,currency,status,provider_transfer_id,transfer_reference").eq("id", deliveryId).single();
  if (result.error) throw projectErrorFromDatabase(result.error);
  const delivery = result.data;
  if (delivery.provider_transfer_id || delivery.status === "delivered") throw new ProjectServiceError("INVALID_REQUEST", "This reward payout has already been initiated.", 409);
  if (!delivery.amount_minor || delivery.currency !== "NGN") throw new ProjectServiceError("INVALID_REQUEST", "Only funded NGN cash rewards can be paid through Flutterwave.", 400);
  const profile = await supabaseAdmin.from("ascend_project_payment_profiles").select("provider_beneficiary_id,verification_status").eq("user_id", delivery.user_id).maybeSingle();
  if (profile.error) throw projectErrorFromDatabase(profile.error);
  if (!profile.data || profile.data.verification_status !== "verified") {
    await supabaseAdmin.from("ascend_project_reward_deliveries").update({ status: "information_required" }).eq("id", deliveryId);
    throw new ProjectServiceError("INVALID_REQUEST", "The participant must verify a payout account first.", 409);
  }
  const reference = delivery.transfer_reference || projectTransferReference(deliveryId);
  const reserved = await supabaseAdmin.from("ascend_project_reward_deliveries").update({ status: "processing", payment_provider: "flutterwave", transfer_reference: reference, initiated_by: adminId, initiated_at: new Date().toISOString(), failure_reason: null }).eq("id", deliveryId).is("provider_transfer_id", null).in("status", ["confirmed", "information_required", "issue_reported"]).select("id").maybeSingle();
  if (reserved.error) throw projectErrorFromDatabase(reserved.error);
  if (!reserved.data) throw new ProjectServiceError("INVALID_REQUEST", "This payout is already being processed.", 409);
  try {
    const transfer = await initiateTransfer({ beneficiaryId: profile.data.provider_beneficiary_id, amountMinor: Number(delivery.amount_minor), reference, deliveryId });
    const update = await supabaseAdmin.from("ascend_project_reward_deliveries").update({ provider_transfer_id: transfer.providerTransferId, provider_reference: transfer.reference, status: transfer.status, last_verified_at: new Date().toISOString(), completed_at: transfer.status === "delivered" ? new Date().toISOString() : null }).eq("id", deliveryId).select("id,status,provider_reference").single();
    if (update.error) throw projectErrorFromDatabase(update.error);
    await auditPayout({ deliveryId, actorUserId: adminId, eventType: "reward_payout_initiated", fromStatus: delivery.status, toStatus: transfer.status, metadata: { provider: "flutterwave", reference: transfer.reference } });
    return update.data;
  } catch (error) {
    await supabaseAdmin.from("ascend_project_reward_deliveries").update({ status: "issue_reported", failure_reason: error instanceof Error ? error.message.slice(0, 1000) : "Transfer initiation failed" }).eq("id", deliveryId);
    await auditPayout({ deliveryId, actorUserId: adminId, eventType: "reward_payout_failed_to_start", fromStatus: delivery.status, toStatus: "issue_reported" });
    throw error;
  }
}

export async function reconcileRewardPayout(deliveryId: string) {
  const current = await supabaseAdmin.from("ascend_project_reward_deliveries").select("id,status,provider_transfer_id").eq("id", deliveryId).single();
  if (current.error) throw projectErrorFromDatabase(current.error);
  if (!current.data.provider_transfer_id) throw new ProjectServiceError("INVALID_REQUEST", "This payout has no provider transfer to verify.", 400);
  const transfer = await retrieveTransfer(current.data.provider_transfer_id);
  const result = await supabaseAdmin.from("ascend_project_reward_deliveries").update({ status: transfer.status, provider_reference: transfer.reference || undefined, last_verified_at: new Date().toISOString(), completed_at: transfer.status === "delivered" ? new Date().toISOString() : null, failure_reason: transfer.status === "issue_reported" ? `Flutterwave status: ${transfer.rawStatus}` : null }).eq("id", deliveryId).select("id,status,provider_reference,last_verified_at").single();
  if (result.error) throw projectErrorFromDatabase(result.error);
  await auditPayout({ deliveryId, eventType: "reward_payout_reconciled", fromStatus: current.data.status, toStatus: transfer.status, metadata: { provider_status: transfer.rawStatus } });
  return result.data;
}

export async function processFlutterwaveWebhook(payload: unknown) {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : record;
  const reference = String(data.reference ?? "");
  if (!reference) return;
  const current = await supabaseAdmin.from("ascend_project_reward_deliveries").select("id,status").eq("transfer_reference", reference).maybeSingle();
  if (current.error) throw projectErrorFromDatabase(current.error);
  if (!current.data) return;
  const status = mapFlutterwaveTransferStatus(data.status);
  const result = await supabaseAdmin.from("ascend_project_reward_deliveries").update({ status, provider_transfer_id: data.id ? String(data.id) : undefined, provider_reference: reference, last_verified_at: new Date().toISOString(), completed_at: status === "delivered" ? new Date().toISOString() : null, failure_reason: status === "issue_reported" ? String(data.complete_message ?? "Flutterwave reported a failed transfer").slice(0, 1000) : null }).eq("id", current.data.id).select("id").single();
  if (result.error) throw projectErrorFromDatabase(result.error);
  await auditPayout({ deliveryId: current.data.id, eventType: "reward_payout_webhook", fromStatus: current.data.status, toStatus: status, metadata: { provider_status: String(data.status ?? "") } });
}
