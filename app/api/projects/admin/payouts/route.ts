import { NextResponse } from "next/server";
import { requireProjectsAdmin } from "@/lib/projects/admin-auth";
import { projectApiError } from "@/lib/projects/api";
import { initiateRewardPayout, reconcileRewardPayout } from "@/lib/projects/payment-service";
export async function POST(request: Request) { try { const { userId } = await requireProjectsAdmin(); const body = await request.json(); const payout = body.action === "reconcile" ? await reconcileRewardPayout(String(body.deliveryId)) : await initiateRewardPayout(String(body.deliveryId), userId); return NextResponse.json({ payout }); } catch (error) { return projectApiError(error); } }
