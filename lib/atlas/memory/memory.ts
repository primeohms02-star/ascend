export type AtlasMemory = {
  completedSkills: string[];
  completedCourses: string[];
  completedProjects: string[];
  completedOpportunities: string[];
  lastActivity?: string;
};

export const EmptyMemory: AtlasMemory = {
  completedSkills: [],
  completedCourses: [],
  completedProjects: [],
  completedOpportunities: [],
};