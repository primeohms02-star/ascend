export type PayoutStatus = "confirmed" | "information_required" | "processing" | "delivered" | "issue_reported" | "resolved" | "cancelled";
export type PaymentMode = "test" | "live";
export type PaymentConfig = { provider: "flutterwave"; mode: PaymentMode; enabled: boolean; secretKey: string; secretHash: string; baseUrl: string };
export type Bank = { code: string; name: string };
export type VerifiedBeneficiary = { providerBeneficiaryId: string; accountName: string; bankCode: string; bankName: string; accountLast4: string; currency: "NGN" };
export type TransferResult = { providerTransferId: string; reference: string; status: PayoutStatus; rawStatus: string };
