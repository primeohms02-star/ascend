export type AtlasProfileState = Record<string, unknown> & {
  north_star?: string | null;
  journey?: string | null;
  progress?: number | null;
};

export type AtlasMomentumState = Record<string, unknown> & {
  current_streak?: number | null;
  completed_missions?: number | null;
  skipped_missions?: number | null;
};

export type AtlasMissionState = Record<string, unknown> & {
  mission?: string | null;
  reason?: string | null;
};

export type AtlasBrainState = {
  profile: AtlasProfileState | null;

  journey: string;

  momentum: AtlasMomentumState | null;

  strategy: unknown;

  knowledge: unknown;

  reflections: unknown[];

  completedMissions: string[];

  activeMission: AtlasMissionState | null;

  opportunities: Array<Record<string, unknown>>;

  recommendations: unknown[];

  northStar: string;

  progress: number;

  ascensionScore: number;

  patterns: {
    strengths: string[];
    weaknesses: string[];
    habits: string[];
  };
};
