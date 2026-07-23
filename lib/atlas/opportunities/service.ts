import { fetchAllSources } from "./connectors";
import { buildOpportunityProfile } from "./build-profile";
import { discoverOpportunities } from "./engine";
import { rankOpportunities } from "./intelligence";
import { recordImpression } from "./impressions";
import { rotateOpportunities } from "./rotation";

export async function getPersonalizedOpportunities(profile: any) {

 const opportunityProfile =
  await buildOpportunityProfile({
    clerkId: profile.clerkId,
  });

  const discovered =
    await discoverOpportunities(opportunityProfile);

 const ranked =
  await rankOpportunities(
    discovered,
    opportunityProfile
  );

// Record every opportunity Atlas shows
for (const opportunity of ranked) {
  await recordImpression(
    opportunityProfile.clerkId,
    opportunity.id
  );
}

  const rotated =
  rotateOpportunities(ranked, 5);

return rotated;
}