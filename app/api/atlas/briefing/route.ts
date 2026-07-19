
import {
  hasSeenNotification,
  saveNotification,
} from "@/lib/atlas/notificationMemory";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { loadAtlasContext } from "@/lib/atlas/brain";
import { buildNotification } from "@/lib/atlas/notifications";
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const atlas = await loadAtlasContext(userId);

  const notificationId = `mission-${atlas.mission?.id ?? "none"}`;

  const mission =
    atlas.mission?.mission ?? "No active mission";

  const streak =
    atlas.momentum?.current_streak ?? 0;

  const greeting =
    streak === 0
      ? `Welcome back.

Your mission is "${mission}".

Let's rebuild your momentum today.`
      : `Welcome back.

Current mission:

${mission}

You're on a ${streak}-day streak.

Keep climbing toward your North Star.`;

const notification = buildNotification(atlas);

const finalGreeting = notification
  ? `${greeting}

━━━━━━━━━━━━━━━━━━

${notification.title}

${notification.message}`
  : greeting;

 const seen = await hasSeenNotification(
  userId,
  notificationId
);

if (!seen) {
  await saveNotification(
    userId,
    notificationId
  );

  return NextResponse.json({
    greeting,
    mission,
    streak,
    isNew: true,
  });
}

return NextResponse.json({
  greeting: "",
  mission,
  streak,
  isNew: false,
});
}