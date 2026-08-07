import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  classifySupportRequest,
} from "@/lib/support/classifier";

import {
  createSupportCase,
} from "@/lib/support/cases";

import type {
  CreateSupportCaseRequest,
  CreateSupportCaseResponse,
  SupportCaseErrorResponse,
  SupportEvidence,
  SupportMessage,
} from "@/lib/support/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONVERSATION_MESSAGES = 20;
const MAX_EVIDENCE_ITEMS = 10;

function cleanString(
  value: unknown,
  maximumLength: number
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maximumLength);
}

function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function cleanConversation(
  value: unknown
): SupportMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(
      -MAX_CONVERSATION_MESSAGES
    )
    .map((item, index) => {
      const record =
        typeof item === "object" &&
        item !== null
          ? (item as Record<
              string,
              unknown
            >)
          : {};

      const role: SupportMessage["role"] =
        record.role ===
        "assistant"
          ? "assistant"
          : "user";

      return {
        id:
          cleanString(
            record.id,
            120
          ) ||
          `support-case-message-${index}`,

        role,

        content: cleanString(
          record.content,
          MAX_MESSAGE_LENGTH
        ),

        createdAt:
          cleanString(
            record.createdAt,
            80
          ) ||
          new Date().toISOString(),
      };
    })
    .filter(
      (supportMessage) =>
        supportMessage.content
          .length > 0
    );
}

function cleanEvidence(
  value: unknown
): SupportEvidence[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowedTypes:
    SupportEvidence["type"][] = [
      "error_message",
      "page",
      "browser",
      "screenshot",
      "note",
    ];

  return value
    .slice(0, MAX_EVIDENCE_ITEMS)
    .map((item, index) => {
      const record =
        typeof item === "object" &&
        item !== null
          ? (item as Record<
              string,
              unknown
            >)
          : {};

      const requestedType =
        cleanString(
          record.type,
          50
        ) as SupportEvidence["type"];

      const type: SupportEvidence["type"] =
        allowedTypes.includes(
          requestedType
        )
          ? requestedType
          : "note";

      return {
        id:
          cleanString(
            record.id,
            120
          ) ||
          `support-evidence-${index}`,

        type,

        label:
          cleanString(
            record.label,
            200
          ) || "Support evidence",

        value:
          cleanString(
            record.value,
            2000
          ),

        createdAt:
          cleanString(
            record.createdAt,
            80
          ) ||
          new Date().toISOString(),
      };
    })
    .filter(
      (evidence) =>
        evidence.value.length > 0
    );
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as Partial<
        CreateSupportCaseRequest
      >;

    const initialMessage =
      cleanString(
        body.initialMessage,
        MAX_MESSAGE_LENGTH
      );

    if (!initialMessage) {
      const response: SupportCaseErrorResponse =
        {
          success: false,
          error:
            "The original support issue is required before creating a case.",
        };

      return NextResponse.json(
        response,
        {
          status: 400,
        }
      );
    }

    let userId: string | null =
      null;

    try {
      const session =
        await auth();

      userId =
        session.userId ?? null;
    } catch {
      userId = null;
    }

    const contactEmail =
      cleanString(
        body.contactEmail,
        320
      ).toLowerCase();

    if (
      !userId &&
      !isValidEmail(contactEmail)
    ) {
      const response: SupportCaseErrorResponse =
        {
          success: false,
          error:
            "Sign in or provide a valid contact email before escalating this issue.",
        };

      return NextResponse.json(
        response,
        {
          status: 400,
        }
      );
    }

    const diagnosis =
      classifySupportRequest(
        initialMessage
      );

    if (
      !userId &&
      diagnosis.category !== "account" &&
      diagnosis.category !== "authentication"
    ) {
      const response: SupportCaseErrorResponse =
        {
          success: false,
          error:
            "Sign in to create support cases for ASCEND product issues.",
        };

      return NextResponse.json(
        response,
        {
          status: 403,
        }
      );
    }

    const conversation =
      cleanConversation(
        body.conversation
      );

    const evidence =
      cleanEvidence(body.evidence);

    const suggestedActions =
      Array.isArray(
        body.suggestedActions
      )
        ? body.suggestedActions
            .map((action) =>
              cleanString(
                action,
                500
              )
            )
            .filter(Boolean)
            .slice(0, 10)
        : diagnosis.recommendedSteps.slice(
            0,
            3
          );

    const currentPath =
      cleanString(
        body.currentPath,
        500
      );

    const browser = cleanString(
      body.browser,
      500
    );

    const result =
      await createSupportCase({
        userId,

        request: {
          initialMessage,

          diagnosis,

          conversation,

          suggestedActions,

          evidence,

          currentPath:
            currentPath ||
            undefined,

          browser:
            browser ||
            undefined,

          contactEmail:
            contactEmail ||
            undefined,
        },
      });

    const response: CreateSupportCaseResponse =
      {
        success: true,
        duplicate:
          result.duplicate,
        supportCase:
          result.supportCase,
      };

    return NextResponse.json(
      response,
      {
        status:
          result.duplicate
            ? 200
            : 201,
      }
    );
  } catch (error) {
    console.error(
      "Support case API error:",
      error
    );

    const response: SupportCaseErrorResponse =
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not create the support case.",
      };

    return NextResponse.json(
      response,
      {
        status: 500,
      }
    );
  }
}