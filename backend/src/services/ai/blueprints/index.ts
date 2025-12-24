import { Blueprint, BlueprintType } from '../../../types/ai';

const NarrativeBlueprint: Blueprint = {
  type: 'narrative',
  description: 'Classic storytelling structure with a clear beginning, middle, and end.',
  structureStrategy: 'Hook -> Introduction -> Rising Action -> Climax -> Falling Action -> Resolution.',
  pacingStrategy: (duration: number) => {
    // 10% Hook, 15% Intro, 50% Body, 15% Climax, 10% Resolution
    return {
      hookSec: Math.round(duration * 0.10),
      bodySec: Math.round(duration * 0.65), // Intro + Body
      closeSec: Math.round(duration * 0.25)  // Climax + Resolution
    };
  },
  validators: ['timelineCheck', 'causalityCheck'],
  voiceProfile: {
    tone: 'emotive',
    audience: 'general',
    styleRules: [
      "Use short, punchy sentences.",
      "Start with a strong hook/question.",
      "Show, don't just tell.",
      "Avoid meta-references ('this video...')."
    ],
    bannedPhrases: [
      "This video captures...",
      "Our story begins...",
      "Who is he?",
      "The power of friendship",
      "He accomplished his mission",
      "In this video",
      "Let's dive in"
    ],
    bannedCliches: ["Unleash the power", "Hidden gem", "Game changer"],
    ctaPolicy: "Subtle at end only"
  }
};

const TopBlueprint: Blueprint = {
  type: 'top',
  description: 'Ranked list format (Top 10, Top 5).',
  structureStrategy: 'Hook -> Criteria Explanation -> Items (N to 1) -> Conclusion.',
  pacingStrategy: (duration: number, params?: any) => {
    const hook = Math.min(30, Math.round(duration * 0.15));
    const close = Math.min(30, Math.round(duration * 0.10));
    const available = duration - hook - close;
    const count = params?.topCount || 5;
    
    return {
      hookSec: hook,
      bodySec: available,
      closeSec: close,
      secPerItem: Math.floor(available / count)
    };
  },
  validators: ['rankCoverage', 'orderCheck'],
  voiceProfile: {
    tone: 'exciting',
    audience: 'general',
    styleRules: [
      "Fast-paced delivery.",
      "Focus on key differentiators.",
      "Direct address to viewer."
    ],
    bannedPhrases: [
      "Without further ado",
      "Let's get started",
      "Make sure to subscribe"
    ],
    bannedCliches: ["Best of the best", "Ultimate guide"],
    ctaPolicy: "Quick reminder in middle, strong at end"
  }
};

export const Blueprints: Record<BlueprintType, Blueprint> = {
  narrative: NarrativeBlueprint,
  top: TopBlueprint,
  informative: NarrativeBlueprint, // Fallback
  tutorial: NarrativeBlueprint, // Fallback
  review: NarrativeBlueprint, // Fallback
  shorts: NarrativeBlueprint // Fallback
};
