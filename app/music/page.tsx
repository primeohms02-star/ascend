import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { loadMusicProfile } from "@/lib/music/profile";
import AppShell from "@/app/components/navigation/AppShell";

import MusicPathway from "./MusicPathway";

export default async function MusicPage() {
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
