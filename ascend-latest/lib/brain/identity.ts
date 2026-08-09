export type Identity = {
  title: string;

  level: number;

  discipline: number;

  execution: number;

  learning: number;

  leadership: number;

  confidence: number;

  badges: string[];
};

export function createIdentity(): Identity {
  return {
    title: "Explorer",

    level: 1,

    discipline: 0,

    execution: 0,

    learning: 0,

    leadership: 0,

    confidence: 0,

    badges: [],
  };
}