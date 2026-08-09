import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function hasSeenNotification(
  clerkId: string,
  notificationId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_notifications")
      .select("id")
      .eq("user_id", clerkId)
      .eq(
        "notification_id",
        notificationId
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    console.error(
      "Notification Lookup Error:",
      error
    );

    throw error;
  }

  return Boolean(data);
}

export async function saveNotification(
  clerkId: string,
  notificationId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_notifications")
      .upsert(
        {
          user_id: clerkId,
          notification_id:
            notificationId,
        },
        {
          onConflict:
            "user_id,notification_id",

          ignoreDuplicates: true,
        }
      )
      .select()
      .maybeSingle();

  if (error) {
    console.error(
      "Notification Save Error:",
      error
    );

    throw error;
  }

  return data;
}