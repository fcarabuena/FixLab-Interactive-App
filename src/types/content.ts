export type ConstructionTypeId = 'glued-back' | 'clip-back' | 'front-entry';
export type Difficulty = 'easy' | 'moderate' | 'hard';
export type RepairType = 'battery' | 'screen' | 'charging-port';
export type LayerId = 'back-cover' | 'battery' | 'mainboard' | 'charging-flex' | 'display';

export interface ConstructionType {
  id: ConstructionTypeId;
  name: string;
  description: string;
  openingMethod: string;
  riskNotes: string[];
}

export interface ExternalLink {
  title: string;
  url: string;
  source: string;
  license: string;
}

export interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  constructionType: ConstructionTypeId;
  difficulty: Difficulty;
  availableRepairs: RepairType[];
  /** Ids of entries in content/parts.json. */
  parts: string[];
  externalLinks: ExternalLink[];
  isSample: boolean;
}

export interface Part {
  id: string;
  name: string;
  layer: LayerId;
  description: string;
  commonSymptoms: string[];
  /** Shown on the Tools tab of the Explore info panel. */
  tools: string[];
  safetyNotes: string[];
}

/** Guide-level "when to go to a shop instead", shown before the repair starts. */
export interface DiyCheck {
  summary: string;
  goToShopIf: string[];
}

/** Hard stop shown before a risky step. The step stays hidden until confirmed. */
export interface DiyGate {
  question: string;
  stopIf: string[];
}

export interface Step {
  number: number;
  title: string;
  body: string;
  /** Path under assets/, for example "placeholders/guide-battery-glued-back-step-01.png". */
  image: string;
  warnings: string[];
  checklist: string[];
  diyGate?: DiyGate;
}

/** A guide targets one model or a whole construction type, never both. */
type GuideTarget =
  | { modelId: string; constructionType?: never }
  | { constructionType: ConstructionTypeId; modelId?: never };

export type RepairGuide = GuideTarget & {
  id: string;
  title: string;
  repairType: RepairType;
  difficulty: Difficulty;
  estimatedTime: string;
  tools: string[];
  parts: string[];
  diyCheck: DiyCheck;
  steps: Step[];
};

/** A rectangle on the Explore phone drawing, in its 300 x 600 coordinates. */
export interface HitZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One part to find in the Identify the parts simulation. */
export interface IdentifyTarget {
  id: string;
  name: string;
  layer: LayerId;
  clue: string;
  fact: string;
  zones: HitZone[];
  /** Ids of smaller parts that sit on this one, so tapping them also counts. */
  includes?: string[];
}

/** One entry in the Tools & Safety glossary. */
export interface Tool {
  id: string;
  name: string;
  description: string;
  usedFor: string;
  caution: string;
}

export interface SafetyTopic {
  id: string;
  title: string;
  summary: string;
  rules: string[];
}

export interface LessonSection {
  heading: string;
  body: string;
  /** Names a built-in illustration to show under the text. */
  diagram?: 'circuit-symbols';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  summary: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}
