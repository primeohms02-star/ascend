import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/navigation/AppShell";
import MusicPathway from "@/app/music/MusicPathway";
import { loadMusicProfile } from "@/lib/music/profile";

export default async function MusicPathwayPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await loadMusicProfile(userId);

  return (
    <AppShell>
      <MusicPathway initialProfile={profile} />
    </AppShell>
  );
}
