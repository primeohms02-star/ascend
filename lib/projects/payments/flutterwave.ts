import "server-only";
import { requirePaymentConfig } from "./config";
import { mapFlutterwaveTransferStatus } from "./security";
import type { Bank, TransferResult, VerifiedBeneficiary } from "./types";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const config = requirePaymentConfig();
  const response = await fetch(`${config.baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${config.secretKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) }, cache: "no-store" });
  const body = await response.json().catch(() => null) as { status?: string; message?: string; data?: T } | null;
  if (!response.ok || body?.status !== "success" || !body.data) throw new Error(`FLUTTERWAVE_REQUEST_FAILED:${body?.message ?? response.statusText}`);
  return body.data;
}

export async function listNigerianBanks(): Promise<Bank[]> {
  const data = await call<Array<{ code?: string; name?: string }>>("/banks/NG");
  return data.map((item) => ({ code: String(item.code ?? ""), name: String(item.name ?? "") })).filter((item) => item.code && item.name);
}

export async function verifyAndCreateBeneficiary(input: { accountNumber: string; bankCode: string; bankName: string }): Promise<VerifiedBeneficiary> {
  const resolved = await call<{ account_name?: string }>("/accounts/resolve", { method: "POST", body: JSON.stringify({ account_number: input.accountNumber, account_bank: input.bankCode }) });
  const accountName = String(resolved.account_name ?? "").trim();
  if (!accountName) throw new Error("FLUTTERWAVE_ACCOUNT_NOT_RESOLVED");
  const beneficiary = await call<{ id?: number | string }>("/beneficiaries", { method: "POST", body: JSON.stringify({ account_number: input.accountNumber, account_bank: input.bankCode, beneficiary_name: accountName }) });
  if (beneficiary.id === undefined) throw new Error("FLUTTERWAVE_BENEFICIARY_NOT_CREATED");
  return { providerBeneficiaryId: String(beneficiary.id), accountName, bankCode: input.bankCode, bankName: input.bankName, accountLast4: input.accountNumber.slice(-4), currency: "NGN" };
}

export async function initiateTransfer(input: { beneficiaryId: string; amountMinor: number; reference: string; deliveryId: string }): Promise<TransferResult> {
  const data = await call<{ id?: number | string; reference?: string; status?: string }>("/transfers", { method: "POST", body: JSON.stringify({ beneficiary: Number(input.beneficiaryId), amount: input.amountMinor / 100, currency: "NGN", reference: input.reference, narration: "ASCEND Project reward", meta: { project_reward_delivery_id: input.deliveryId } }) });
  if (data.id === undefined) throw new Error("FLUTTERWAVE_TRANSFER_NOT_CREATED");
  return { providerTransferId: String(data.id), reference: String(data.reference ?? input.reference), status: mapFlutterwaveTransferStatus(data.status), rawStatus: String(data.status ?? "NEW") };
}

export async function retrieveTransfer(id: string): Promise<TransferResult> {
  const data = await call<{ id?: number | string; reference?: string; status?: string }>(`/transfers/${encodeURIComponent(id)}`);
  return { providerTransferId: String(data.id ?? id), reference: String(data.reference ?? ""), status: mapFlutterwaveTransferStatus(data.status), rawStatus: String(data.status ?? "") };
}
