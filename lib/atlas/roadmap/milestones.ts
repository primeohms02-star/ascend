export type Milestone = {
  title: string;
  minimumReadiness: number;
};

export const CareerMilestones: Milestone[] = [
  {
    title: "Explorer",
    minimumReadiness: 0,
  },
  {
    title: "Builder",
    minimumReadiness: 25,
  },
  {
    title: "Practitioner",
    minimumReadiness: 50,
  },
  {
    title: "Opportunity Ready",
    minimumReadiness: 75,
  },
  {
    title: "Professional",
    minimumReadiness: 90,
  },
];

export function getCurrentMilestone(score: number): Milestone {
  return (
    [...CareerMilestones]
      .reverse()
      .find(
        (milestone) =>
          score >= milestone.minimumReadiness
      ) ?? CareerMilestones[0]
  );
}