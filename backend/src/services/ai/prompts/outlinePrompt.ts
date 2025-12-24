import { ProjectBrief, Budget, Blueprint } from '../../../types/ai';

export const generateOutlinePrompt = (brief: ProjectBrief, budget: Budget, blueprint: Blueprint): string => {
  return `
    You are an expert video strategist.
    Create a Master Outline for a video.
    
    CONTEXT:
    Title: ${brief.title}
    Goal: ${brief.goal}
    Format: ${brief.format}
    Blueprint: ${blueprint.type.toUpperCase()}
    Strategy: ${blueprint.structureStrategy}
    
    PACING BUDGET:
    - Total Duration: ${brief.targetDurationSec}s
    - Total Target Words: ${budget.targetWords}
    - Hook/Intro: ~${budget.hookSec}s
    - Main Body: ~${budget.bodySec}s
    - Conclusion: ~${budget.closeSec}s
    
    Output strictly a JSON object:
    {
      "sections": [
        {
          "id": "S1",
          "title": "Hook",
          "goal": "Grab attention...",
          "timeBudgetSec": 15,
          "wordBudget": 40, 
          "keyPoints": ["..."],
          "bridgeToNext": "..."
        }
      ],
      "entities": [
         { "name": "Name", "type": "character/object/location", "description": "Short visual description" }
      ]
    }
    
    IMPORTANT:
    - Assign a specific 'wordBudget' to each section based on 130 WPM.
    - Ensure sum of wordBudget is roughly ${budget.targetWords}.
    - MAX TOTAL WORDS: ${budget.maxWords}. Do NOT exceed this.
    - Ensure sum of timeBudgetSec is exactly ${brief.targetDurationSec}.
    
    Do not use markdown backticks. Return RAW JSON.
  `;
};
