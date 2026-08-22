export type AscensionState = {
  score: number;
  level: number;
  title: string;
  currentLevelStart: number;
  nextLevelTarget: number;
  progressPercent: number;
  xpIntoLevel: number;
  xpRequiredForLevel: number;
};

type LevelDefinition = {
  level: number;
  minimumScore: number;
  title: string;
};

const ASCENSION_LEVELS: LevelDefinition[] = [
  {
    level: 0,
    minimumScore: 0,
    title: "Explorer",
  },
  {
    level: 1,
    minimumScore: 15,
    title: "Explorer",
  },
  {
    level: 2,
    minimumScore: 30,
    title: "Explorer",
  },
  {
    level: 3,
    minimumScore: 50,
    title: "Pathfinder",
  },
  {
    level: 4,
    minimumScore: 100,
    title: "Pathfinder",
  },
  {
    level: 5,
    minimumScore: 175,
    title: "Builder",
  },
  {
    level: 6,
    minimumScore: 275,
    title: "Builder",
  },
  {
    level: 7,
    minimumScore: 400,
    title: "Visionary",
  },
  {
    level: 8,
    minimumScore: 550,
    title: "Visionary",
  },
  {
    level: 9,
    minimumScore: 750,
    title: "Architect",
  },
  {
    level: 10,
    minimumScore: 1000,
    title: "Ascendant",
  },
];

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

export function calculateAscension(
  rawScore: number
): AscensionState {
  const score = Math.max(
    0,
    Math.round(
      Number.isFinite(rawScore)
        ? rawScore
        : 0
    )
  );

  let currentLevel =
    ASCENSION_LEVELS[0];

  for (const levelDefinition of ASCENSION_LEVELS) {
    if (
      score >= levelDefinition.minimumScore
    ) {
      currentLevel = levelDefinition;
    } else {
      break;
    }
  }

  const currentIndex =
    ASCENSION_LEVELS.findIndex(
      (levelDefinition) =>
        levelDefinition.level ===
        currentLevel.level
    );

  const nextLevel =
    ASCENSION_LEVELS[currentIndex + 1];

  /*
   * Level 10 currently represents the highest defined
   * Ascension level.
   */
  if (!nextLevel) {
    return {
      score,
      level: currentLevel.level,
      title: currentLevel.title,
      currentLevelStart:
        currentLevel.minimumScore,
      nextLevelTarget:
        currentLevel.minimumScore,
      progressPercent: 100,
      xpIntoLevel:
        score - currentLevel.minimumScore,
      xpRequiredForLevel: 0,
    };
  }

  const xpIntoLevel =
    score - currentLevel.minimumScore;

  const xpRequiredForLevel =
    nextLevel.minimumScore -
    currentLevel.minimumScore;

  const progressPercent = clamp(
    Math.round(
      (xpIntoLevel / xpRequiredForLevel) *
        100
    ),
    0,
    100
  );

  return {
    score,
    level: currentLevel.level,
    title: currentLevel.title,
    currentLevelStart:
      currentLevel.minimumScore,
    nextLevelTarget:
      nextLevel.minimumScore,
    progressPercent,
    xpIntoLevel,
    xpRequiredForLevel,
  };
}
