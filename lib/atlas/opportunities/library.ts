import "server-only";

import {
  storeOpportunitySnapshotForMemory,
  type OpportunityMemoryRecord,
} from "./memory";
import {
  resolveOpportunityForUser,
} from "./service";

const HYDRATION_BATCH_SIZE = 4;

export async function hydrateOpportunityLibraryRecords(
  userId: string,
  records: OpportunityMemoryRecord[],
): Promise<OpportunityMemoryRecord[]> {
  const hydrated:
    OpportunityMemoryRecord[] = [];

  for (
    let index = 0;
    index < records.length;
    index += HYDRATION_BATCH_SIZE
  ) {
    const batch = records.slice(
      index,
      index + HYDRATION_BATCH_SIZE
    );

    const results = await Promise.all(
      batch.map(
        async (record) => {
          if (record.opportunity?.url) {
            return record;
          }

          try {
            const opportunity =
              await resolveOpportunityForUser(
                userId,
                record.opportunity_id,
                record.source,
                record.opportunity?.snapshotId
              );

            if (!opportunity) {
              return record;
            }

            const { error } =
              await storeOpportunitySnapshotForMemory(
                userId,
                record.opportunity_id,
                opportunity
              );

            if (error) {
              console.error(
                "Opportunity Library Snapshot Backfill Error:",
                error
              );
            }

            return {
              ...record,
              opportunity,
            };
          } catch (error) {
            console.error(
              "Opportunity Library Hydration Error:",
              error
            );

            return record;
          }
        }
      )
    );

    hydrated.push(...results);
  }

  return hydrated;
}
