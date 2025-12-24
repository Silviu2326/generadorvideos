export type BlueprintType = 'top' | 'narrative' | 'informative' | 'tutorial' | 'review' | 'shorts';
export type VisualStyle = 'cyberpunk' | 'anime' | 'minimal' | 'documentary' | 'realistic' | 'comic' | '3d' | 'retro' | 'watercolor' | 'cinematic';

export interface ProjectBrief {
  title: string;
  goal: string;
  format: '16:9' | '9:16' | '1:1';
  targetDurationSec: number;
  cadenceSec?: number; // Default 5
  blueprint: BlueprintType;
  visualStyle: VisualStyle;
  languages: string[];
  voice?: {
    [key: string]: { voiceId: string };
  };
  noTextInImages?: boolean;
  subtitlesEnabled?: boolean; // New field for safe area check
  brandKit?: {
    logoUrl?: string;
    colors?: string[];
    fonts?: string[];
  };
  blueprintParams?: any;
}

export interface Budget {
  wpm: number;
  targetWords: number;
  minWords: number;
  maxWords: number;
  // Pacing
  hookSec: number;
  bodySec: number;
  closeSec: number;
  secPerItem?: number; // For lists/tops
}

export interface VoiceProfile {
  tone: string; // e.g., "comic", "emotive", "documentary"
  audience: string; // e.g., "children", "general", "adult"
  styleRules: string[];
  bannedPhrases: string[];
  bannedCliches: string[];
  ctaPolicy: string;
}

export interface Blueprint {
  type: BlueprintType;
  description: string;
  structureStrategy: string; // Description for LLM
  pacingStrategy: (duration: number, params?: any) => Partial<Budget>;
  validators: string[]; // List of validator names
  voiceProfile?: VoiceProfile; // New: Default voice profile
}

export interface OutlineSection {
  id: string;
  title: string;
  goal: string;
  timeBudgetSec: number;
  wordBudget: number; // Ensure this is explicitly requested
  keyPoints: string[];
  bridgeToNext?: string;
}

export interface ScriptEntity {
  name: string;
  description: string; // visual traits, role
  type: 'character' | 'object' | 'location';
}

export interface ScriptMemory {
  thesis: string;
  outlineSummary: string;
  runningSummary: string;
  facts: string[];
  bannedRepetitions: string[];
  // New Fields
  terminologyLock: string[]; // ["Item", "Ranking"]
  entities: ScriptEntity[]; // For narrative consistency
  styleVoiceRules: string[]; // ["Short sentences", "Direct tone"]
}

export interface ScriptBlock {
  sectionId: string;
  text: string;
  translations?: { [lang: string]: string };
  wordCount: number;
  estimatedSec: number;
  version: number;
}

export interface SceneSegment {
  id: string; // SEG_001
  sectionId: string; // Link to parent section
  startSec: number;
  endSec: number;
  narration: string;
  visualIntent: string;
  shotType: 'broll' | 'graphic' | 'talking-head' | 'screen';
  beatType?: 'hook' | 'explanation' | 'example' | 'transition';
  visualRole?: 'establishing' | 'supporting' | 'recap' | 'cta';
  continuityTags?: string[];
  imageUrl?: string;
  audioUrl?: string;
}

export interface StyleBible {
  palette: string[];
  lighting: string;
  camera: string;
  negativePrompt: string;
  promptTemplate: string;
  globalLocks?: string[];
  // New: Visual Character/Entity Bible for Narrative
  continuityBible?: {
      [entityName: string]: string; // Visual description to inject
  };
}

export interface PromptCard {
  segmentId: string;
  finalPositivePrompt: string;
  finalNegativePrompt: string;
  globalLocks: string[];
  segmentLocks: string[];
  noTextRule: boolean;
  composition?: string;
  safeArea?: string; // "bottom-center"
  qaStatus?: 'passed' | 'fixed' | 'warning';
  qaIssues?: string[];
}

export interface ValidationIssue {
  type: 'info' | 'warn' | 'fail';
  where?: string;
  message: string;
}

export interface ProjectPackage {
  projectId?: string;
  runId: string;
  version: string;
  blueprint: BlueprintType;
  budgets: Budget;
  outline: { sections: OutlineSection[] };
  scriptBlocks: ScriptBlock[];
  sceneMap: SceneSegment[];
  styleBible: StyleBible;
  promptCards: PromptCard[];
  brief?: ProjectBrief; // Persist the original brief
  validation: {
    status: 'ok' | 'warn' | 'fail';
    issues: ValidationIssue[];
  };
  entitiesLock?: ScriptEntity[]; // New: Single source of truth for entities
  voiceStyleInstructions?: string;
  fullAudioUrl?: string;
}
