import { ProjectBrief, OutlineSection, ScriptMemory } from '../../../types/ai';

export const generateScriptSectionPrompt = (brief: ProjectBrief, section: OutlineSection, memory: ScriptMemory): string => {
  // 5) Adjust budgets (avoid empty scripts)
  let minWords = Math.floor(section.wordBudget * 0.85);
  let maxWords = Math.ceil(section.wordBudget * 1.15);
  
  // Enforce minimums for short sections to avoid "slogans"
  if (minWords < 20) {
      minWords = 18;
      maxWords = Math.max(35, maxWords);
  }

  return `
    Write the script for ONE section of a video.
    
    LANGUAGE: ${brief.languages.join(', ')} (MUST be written in this language).
    
    SECTION SPECS:
    - ID: ${section.id}
    - Title: ${section.title}
    - Goal: ${section.goal}
    - Word Target: ${minWords} - ${maxWords} words. (STRICT LIMIT. Do not exceed ${maxWords} words).
    
    MEMORY & CONTEXT:
    - Thesis: ${memory.thesis}
    - Running Summary: ${memory.runningSummary}
    
    CONSTRAINTS:
    - BANNED PHRASES (STRICT): ${memory.bannedRepetitions.join(', ')}
    - Style Rules: ${memory.styleVoiceRules.join('; ')}
    - NO META-COMMENTARY: Do not say "In this video", "Our story", "Let's look at". Just tell the story.
    
    ENTITIES (Use these exact names/descriptions):
    ${memory.entities.map(e => `- ${e.name} (${e.type}): ${e.description}`).join('\n')}
    
    INSTRUCTIONS:
    - Write strictly the spoken text (VO/Dialogue). 
    - No scene descriptions, no "Narrator:" prefixes.
    - Focus on flow and hook the viewer.
    - Include 1 CONCRETE DETAIL (action, emotion, or consequence).
    - If bridging to next section, hint at: ${section.bridgeToNext || 'next topic'}.
  `;
};
