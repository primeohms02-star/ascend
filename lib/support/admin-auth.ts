import {
  auth,
} from "@clerk/nextjs/server";

function getAdminUserIds(): Set<string> {
  const configuredIds =
    process.env
      .SUPPORT_ADMIN_USER_IDS ??
    "";

  const userIds =
    configuredIds
      .split(",")
      .map((value) =>
        value.trim()
      )
      .filter(Boolean);

  return new Set(userIds);
}

export function isSupportAdmin(
  userId?: string | null
): boolean {
  if (!userId) {
    return false;
  }

  return getAdminUserIds().has(
    userId
  );
}

export async function requireSupportAdmin(): Promise<{
  userId: string;
}> {
  const {
    userId,
  } = await auth();

  if (!userId) {
    throw new Error(
      "SUPPORT_ADMIN_UNAUTHENTICATED"
    );
  }

  if (
    !isSupportAdmin(userId)
  ) {
    throw new Error(
      "SUPPORT_ADMIN_FORBIDDEN"
    );
  }

  return {
    userId,
  };
}