import { auth } from "@clerk/nextjs/server";

function configuredAdminIds(): Set<string> {
  const raw = [
    process.env.ASCEND_WORK_ADMIN_USER_IDS,
    process.env.SUPPORT_ADMIN_USER_IDS,
  ]
    .filter(Boolean)
    .join(",");

  return new Set(raw.split(",").map((value) => value.trim()).filter(Boolean));
}

export function isAscendWorkAdmin(userId?: string | null): boolean {
  return Boolean(userId && configuredAdminIds().has(userId));
}

export async function requireAscendWorkAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("ASCEND_WORK_UNAUTHENTICATED");
  if (!isAscendWorkAdmin(userId)) throw new Error("ASCEND_WORK_FORBIDDEN");
  return userId;
}

