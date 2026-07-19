import { loadAtlasContext } from "./brain";

export async function getAtlasDashboard(
  clerkId: string
) {
  const atlas = await loadAtlasContext(clerkId);

  const currentMission = atlas.mission;

  return {
   dailyBriefing: {
  ...atlas.dailyBriefing,
  focus:
    atlas.mission?.mission ??
    atlas.dailyBriefing.focus,
},
   compass: {
  northStar:
    atlas.profile.north_star ?? "Discover your purpose",

  alignment:
    Number(atlas.profile.progress ?? 0),
},
   mission: {
  title:
    currentMission?.mission ??
    "Today's Mission",

  description:
    currentMission?.reason ??
    "No mission available.",

  missionId:
    currentMission?.id ?? "",
},
progress: {
  progress: Number(atlas.profile.progress ?? 0),

  momentum: `${atlas.momentum?.current_streak ?? 0} Day Streak`,

  message:
    atlas.progress?.momentumMessage ??
    "Keep moving toward your North Star.",
},

   identity: {
  title:
    atlas.identity?.title ??
    atlas.profile.journey,

  level:
    atlas.identity?.level ?? 1,
},

  atlasProgress: {
  ascension_score:
    Number(atlas.momentum?.ascension_score ?? 0),

  level:
    Number(
      atlas.momentum?.ascension_score ?? 0
    ) >= 1000
      ? 5
      : Number(
          atlas.momentum?.ascension_score ?? 0
        ) >= 500
      ? 4
      : Number(
          atlas.momentum?.ascension_score ?? 0
        ) >= 250
      ? 3
      : Number(
          atlas.momentum?.ascension_score ?? 0
        ) >= 100
      ? 2
      : 1,
},

    profile:
      atlas.profile,

    strategy:
      atlas.strategy,

    knowledge:
      atlas.knowledge,

    reflection:
      atlas.reflection,

    journey:
      atlas.journey,

    compassAnswers:
      atlas.compassAnswers,

    compassResults:
      atlas.compassResults,

    opportunities:
      atlas.opportunities ?? [],

    recommendations:
      atlas.recommendations ?? [],
     timeline:
  atlas.timeline ?? [], 
  };
}