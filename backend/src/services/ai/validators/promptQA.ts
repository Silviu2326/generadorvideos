import { PromptCard } from '../../../types/ai';

const TEXT_KEYWORDS = ['text', 'typography', 'letters', 'words', 'signage', 'caption', 'subtitle', 'label', 'logo'];
const MAX_PROMPT_LENGTH = 450;

export const validatePromptCard = (card: PromptCard, subtitlesEnabled: boolean = true): PromptCard => {
  const issues: string[] = [];
  
  // Check 1: Forbidden text keywords in POSITIVE prompt only
  if (card.noTextRule) {
    const found = TEXT_KEYWORDS.filter(kw => card.finalPositivePrompt.toLowerCase().includes(kw));
    if (found.length > 0) {
      issues.push(`Positive prompt contains text keywords: ${found.join(', ')}`);
      // Could auto-fix by removing them here
      card.qaStatus = 'warning';
    }
  }

  // Check 2: Length
  if (card.finalPositivePrompt.length < 15) {
    issues.push("Prompt too short (<15 chars)");
    card.qaStatus = 'warning';
  }
  if (card.finalPositivePrompt.length > MAX_PROMPT_LENGTH) {
    issues.push(`Prompt too long (> ${MAX_PROMPT_LENGTH} chars)`);
    card.qaStatus = 'warning';
  }

  // Check 3: Global Locks
  if (card.globalLocks && card.globalLocks.length > 0) {
     const missing = card.globalLocks.filter(lock => !card.finalPositivePrompt.toLowerCase().includes(lock.toLowerCase()));
     if (missing.length > 0) {
         issues.push(`Missing global locks: ${missing.join(', ')}`);
         card.qaStatus = 'warning';
     }
  }

  // Check 4: Safe Area (if subtitles enabled)
  if (subtitlesEnabled) {
      // Check if composition or prompt mentions spacing
      const safeKeywords = ['space', 'copy space', 'clean background', 'bottom', 'top', 'thirds', 'centered'];
      const combined = (card.composition || '') + card.finalPositivePrompt;
      const hasSafeMention = safeKeywords.some(kw => combined.toLowerCase().includes(kw));
      
      if (!hasSafeMention) {
          // Not a hard fail, but good to know
          issues.push("No explicit safe area/composition strategy found for subtitles.");
          card.qaStatus = 'warning'; 
      }
  }

  card.qaIssues = issues;
  if (issues.length === 0) {
    card.qaStatus = 'passed';
  }

  return card;
};

export const batchValidatePrompts = (cards: PromptCard[], subtitlesEnabled: boolean = true): PromptCard[] => {
  return cards.map(c => validatePromptCard(c, subtitlesEnabled));
};