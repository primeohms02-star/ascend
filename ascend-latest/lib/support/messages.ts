import {
  supabaseServer,
} from "@/lib/supabase-server";

import type {
  SupportCaseMessage,
  SupportCaseMessageSender,
} from "./types";

type SupportCaseMessageRow = {
  id: string;
  case_id: string;
  sender_type: string;
  sender_user_id: string | null;
  sender_name: string | null;
  message: string;
  created_at: string;
};

type CreateMessageOptions = {
  caseId: string;
  senderType: SupportCaseMessageSender;
  senderUserId?: string | null;
  senderName?: string | null;
  message: string;
};

function mapSupportCaseMessage(
  value: unknown
): SupportCaseMessage {
  const row =
    value as SupportCaseMessageRow;

  const senderType:
    SupportCaseMessageSender =
    row.sender_type ===
      "support" ||
    row.sender_type ===
      "system"
      ? row.sender_type
      : "user";

  return {
    id: row.id,

    caseId:
      row.case_id,

    senderType,

    senderUserId:
      row.sender_user_id,

    senderName:
      row.sender_name,

    message:
      row.message,

    createdAt:
      row.created_at,
  };
}

function cleanMessage(
  value: string
): string {
  return value
    .replace(
      /\u0000/g,
      ""
    )
    .trim()
    .slice(0, 5000);
}

function cleanName(
  value?: string | null
): string | null {
  const name =
    value
      ?.replace(
        /\u0000/g,
        ""
      )
      .trim()
      .slice(0, 200);

  return name || null;
}

export async function listSupportCaseMessages(
  caseId: string
): Promise<
  SupportCaseMessage[]
> {
  const normalizedCaseId =
    caseId.trim();

  if (!normalizedCaseId) {
    return [];
  }

  const {
    data,
    error,
  } =
    await supabaseServer
      .from(
        "ascend_support_case_messages"
      )
      .select("*")
      .eq(
        "case_id",
        normalizedCaseId
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )
      .limit(500);

  if (error) {
    console.error(
      "Support message list error:",
      error
    );

    throw new Error(
      "ASCEND could not load the case conversation."
    );
  }

  return (
    data ?? []
  ).map(
    mapSupportCaseMessage
  );
}

export async function createSupportCaseMessage({
  caseId,
  senderType,
  senderUserId,
  senderName,
  message,
}: CreateMessageOptions): Promise<
  SupportCaseMessage
> {
  const normalizedCaseId =
    caseId.trim();

  const normalizedMessage =
    cleanMessage(message);

  if (!normalizedCaseId) {
    throw new Error(
      "A support case ID is required."
    );
  }

  if (!normalizedMessage) {
    throw new Error(
      "A reply message is required."
    );
  }

  const {
    data,
    error,
  } =
    await supabaseServer
      .from(
        "ascend_support_case_messages"
      )
      .insert({
        case_id:
          normalizedCaseId,

        sender_type:
          senderType,

        sender_user_id:
          senderUserId ??
          null,

        sender_name:
          cleanName(
            senderName
          ),

        message:
          normalizedMessage,
      })
      .select("*")
      .single();

  if (error || !data) {
    console.error(
      "Support message creation error:",
      error
    );

    throw new Error(
      "ASCEND could not send the support reply."
    );
  }

  const updateValues: {
    updated_at: string;
    status?: string;
  } = {
    updated_at:
      new Date().toISOString(),
  };

  /*
   * A user reply means the case is ready
   * for support to review again.
   */
  if (
    senderType === "user"
  ) {
    updateValues.status =
      "open";
  }

  const {
    error: caseUpdateError,
  } =
    await supabaseServer
      .from(
        "ascend_support_cases"
      )
      .update(
        updateValues
      )
      .eq(
        "id",
        normalizedCaseId
      );

  if (caseUpdateError) {
    console.error(
      "Support case timestamp update error:",
      caseUpdateError
    );
  }

  return mapSupportCaseMessage(
    data
  );
}

export async function createSystemCaseMessage({
  caseId,
  message,
}: {
  caseId: string;
  message: string;
}): Promise<
  SupportCaseMessage
> {
  return createSupportCaseMessage({
    caseId,
    senderType: "system",
    senderName:
      "ASCEND Support",
    message,
  });
}