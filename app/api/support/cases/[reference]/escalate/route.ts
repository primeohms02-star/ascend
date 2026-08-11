import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { supabaseServer } from "@/lib/supabase-server";
import { getSupportCaseByReference } from "@/lib/support/cases";
import { createSupportCaseMessage } from "@/lib/support/messages";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

function normalizeReference(value: string): string {
  return value.trim().toUpperCase().slice(0, 40);
}

function normalizeReason(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/\u0000/g, "").trim().slice(0, 4000)
    : "";
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Sign in to escalate a support case." },
        { status: 401 }
      );
    }

    const { reference } = await context.params;
    const referenceNumber = normalizeReference(reference);
    const body = (await request.json()) as { reason?: unknown };
    const reason = normalizeReason(body.reason);

    if (!referenceNumber || !reason) {
      return NextResponse.json(
        { success: false, error: "Explain why this case needs escalation." },
        { status: 400 }
      );
    }

    const supportCase = await getSupportCaseByReference({
      referenceNumber,
      userId,
    });

    if (!supportCase) {
      return NextResponse.json(
        { success: false, error: "The requested support case was not found." },
        { status: 404 }
      );
    }

    if (supportCase.status === "resolved" || supportCase.status === "closed") {
      return NextResponse.json(
        {
          success: false,
          error: "Resolved or closed cases cannot be escalated. Reply to Support if the issue has returned.",
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const nextUrgency = supportCase.urgency === "critical" ? "critical" : "high";

    const { error } = await supabaseServer
      .from("ascend_support_cases")
      .update({
        status: "investigating",
        urgency: nextUrgency,
        escalated_at: now,
        updated_at: now,
      })
      .eq("id", supportCase.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Support escalation update error:", error);
      throw new Error("ASCEND could not escalate this support case.");
    }

    await createSupportCaseMessage({
      caseId: supportCase.id,
      senderType: "system",
      senderUserId: userId,
      senderName: "ASCEND Support",
      message: `Case escalated by the user. Reason: ${reason}`,
    });

    const updatedCase = await getSupportCaseByReference({
      referenceNumber,
      userId,
    });

    return NextResponse.json({
      success: true,
      supportCase: updatedCase,
    });
  } catch (error) {
    console.error("Support case escalation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not escalate this support case.",
      },
      { status: 500 }
    );
  }
}
