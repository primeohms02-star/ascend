import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { projectApiError } from "@/lib/projects/api";
import { getPaymentProfile, paymentReadiness, savePaymentProfile } from "@/lib/projects/payment-service";
export async function GET() { try { const { userId } = await auth(); if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json({ profile: await getPaymentProfile(userId), readiness: await paymentReadiness() }); } catch (error) { return projectApiError(error); } }
export async function POST(request: Request) { try { const { userId } = await auth(); if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json({ profile: await savePaymentProfile(userId, await request.json()) }); } catch (error) { return projectApiError(error); } }
