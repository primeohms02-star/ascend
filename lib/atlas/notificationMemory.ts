import { supabaseServer } from "@/lib/supabase-server";

export async function hasSeenNotification(
  clerkId: string,
  notificationId: string
) {
  const { data } = await supabaseServer
    .from("atlas_notifications")
    .select("id")
    .eq("user_id", clerkId)
    .eq("notification_id", notificationId)
    .maybeSingle();

  return !!data;
}

export async function saveNotification(
  clerkId: string,
  notificationId: string
) {
  await supabaseServer
    .from("atlas_notifications")
    .insert({
      user_id: clerkId,
      notification_id: notificationId,
    });
}