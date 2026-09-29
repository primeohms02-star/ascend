import "server-only";
import type { PaymentConfig } from "./types";

export function getPaymentConfig(): PaymentConfig {
  const mode = process.env.PROJECTS_PAYMENTS_MODE === "live" ? "live" : "test";
  return { provider: "flutterwave", mode, enabled: process.env.PROJECTS_PAYMENTS_ENABLED === "true", secretKey: process.env.FLW_SECRET_KEY ?? "", secretHash: process.env.FLW_SECRET_HASH ?? "", baseUrl: "https://api.flutterwave.com/v3" };
}

export function requirePaymentConfig() {
  const config = getPaymentConfig();
  if (!config.enabled) throw new Error("PROJECT_PAYMENTS_DISABLED");
  if (!config.secretKey) throw new Error("PROJECT_PAYMENTS_NOT_CONFIGURED");
  if (config.mode === "live" && !config.secretKey.includes("_LIVE-")) throw new Error("PROJECT_PAYMENTS_LIVE_KEY_REQUIRED");
  return config;
}
