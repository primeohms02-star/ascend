import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { projectApiError } from "@/lib/projects/api";
import { getBanks } from "@/lib/projects/payment-service";
export async function GET() { try { const { userId } = await auth(); if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await getBanks()); } catch (error) { return projectApiError(error); } }
