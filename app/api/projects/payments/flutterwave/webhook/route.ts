import { NextResponse } from "next/server";
import { getPaymentConfig } from "@/lib/projects/payments/config";
import { processFlutterwaveWebhook } from "@/lib/projects/payment-service";
import { verifyFlutterwaveWebhook } from "@/lib/projects/payments/security";
export async function POST(request: Request) { const raw = await request.text(); const config = getPaymentConfig(); if (!verifyFlutterwaveWebhook(raw, request.headers, config.secretHash)) return new NextResponse(null, { status: 401 }); try { await processFlutterwaveWebhook(JSON.parse(raw)); return new NextResponse(null, { status: 200 }); } catch (error) { console.error("Flutterwave webhook error", error); return new NextResponse(null, { status: 500 }); } }
