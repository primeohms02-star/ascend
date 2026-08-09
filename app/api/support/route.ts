import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import Groq from "groq-sdk";

import {
  getGroqReasoningOptions,
  GROQ_MODEL,
} from "@/lib/groq/config";

import {
  classifySupportRequest,
  getSupportContext,
} from "@/lib/support/classifier";

import { buildSupportSystemPrompt } from "@/lib/support/prompt";

import type {
  SupportMessage,
  SupportRequest,
  SupportResponse,
} from "@/lib/support/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 4000;

const MAX_CONVERSATION_MESSAGES = 10;

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

function cleanConversation(
  value: unknown
): SupportMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(-MAX_CONVERSATION_MESSAGES)
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
        record.role === "assistant"
          ? "assistant"
          : "user";

      return {
        id:
          cleanString(
            record.id,
            120
          ) ||
          `support-history-${index}`,

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
        supportMessage.content.length >
        0
    );
}

function createFallbackReply(
  diagnosis: ReturnType<
    typeof classifySupportRequest
  >
): string {
  const steps =
    diagnosis.recommendedSteps
      .slice(0, 4)
      .map(
        (step, index) =>
          `${index + 1}. ${step}`
      )
      .join("\n");

  const escalationMessage =
    diagnosis.requiresEscalation
      ? "\n\nIf this continues, record the affected page, the exact error message and what you already tried so the issue can be escalated."
      : "";

  return `
It looks like you are experiencing: ${diagnosis.title}.

Try these steps:

${steps}

You will know the issue is resolved when the expected ASCEND page or action works without showing the same error.${escalationMessage}
`.trim();
}

export async function POST(
  request: Request
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Sign in to use ASCEND Support AI.",
        },
        {
          status: 401,
        }
      );
    }

    const requestBody =
      (await request.json()) as Partial<
        SupportRequest
      >;

    const message = cleanString(
      requestBody.message,
      MAX_MESSAGE_LENGTH
    );

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Please describe the issue you need help with.",
        },
        {
          status: 400,
        }
      );
    }

    const conversation =
      cleanConversation(
        requestBody.conversation
      );

    const currentPath =
      cleanString(
        requestBody.currentPath,
        500
      );

    const browser = cleanString(
      requestBody.browser,
      500
    );

    const diagnosis =
      classifySupportRequest(message);

    const knowledgeContext =
      getSupportContext(message);

    const systemPrompt =
      buildSupportSystemPrompt({
        message,
        diagnosis,
        knowledgeContext,
        conversation,

        currentPath:
          currentPath || undefined,

        browser:
          browser || undefined,

        userId,
      });

    const apiKey =
      process.env.GROQ_API_KEY;

    let reply: string;

    if (!apiKey) {
      console.warn(
        "GROQ_API_KEY is unavailable. ASCEND Support is using its deterministic fallback."
      );

      reply =
        createFallbackReply(
          diagnosis
        );
    } else {
      try {
        const groq = new Groq({
          apiKey,
        });

        const completion =
          await groq.chat.completions.create({
            model:
              GROQ_MODEL,

            ...getGroqReasoningOptions(),

            temperature: 0.2,

            max_completion_tokens:
              900,

            messages: [
              {
                role: "system",
                content:
                  systemPrompt,
              },
              {
                role: "user",
                content: message,
              },
            ],
          });

        reply =
          completion.choices[0]
            ?.message?.content
            ?.trim() ||
          createFallbackReply(
            diagnosis
          );
      } catch (providerError) {
        console.error(
          "ASCEND Support AI provider error:",
          providerError
        );

        reply =
          createFallbackReply(
            diagnosis
          );
      }
    }

    const response: SupportResponse =
      {
        reply,

        diagnosis,

        suggestedActions:
          diagnosis.recommendedSteps.slice(
            0,
            3
          ),
      };

    return NextResponse.json(
      response
    );
  } catch (error) {
    console.error(
      "ASCEND Support API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "ASCEND Support could not process this request.",
      },
      {
        status: 500,
      }
    );
  }
}
