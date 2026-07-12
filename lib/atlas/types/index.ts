export interface KnowledgeItem {
  category: string;
  fact: string;
}

export interface Identity {
  title: string;
  description: string;
}

export interface CognitionResult {
  knowledge: KnowledgeItem[];
  reflection: string;
  identity: Identity;
}

export interface Brain {
  profile: unknown;
  identity: unknown;
  knowledge: unknown[];
  reflections: unknown[];
}

export interface AtlasResponse {
  answer: string;
  context: string;
}