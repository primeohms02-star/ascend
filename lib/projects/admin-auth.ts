import { auth } from "@clerk/nextjs/server";

function adminIds() {
  return new Set((process.env.PROJECTS_ADMIN_USER_IDS ?? process.env.SUPPORT_ADMIN_USER_IDS ?? "").split(",").map((value)=>value.trim()).filter(Boolean));
}

export function isProjectsAdmin(userId?: string | null) { return Boolean(userId && adminIds().has(userId)); }

export async function requireProjectsAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("PROJECTS_ADMIN_UNAUTHENTICATED");
  if (!isProjectsAdmin(userId)) throw new Error("PROJECTS_ADMIN_FORBIDDEN");
  return { userId };
}
