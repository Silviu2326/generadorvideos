import { SceneSegment, StyleBible, ProjectBrief } from '../../../types/ai';

export const generatePromptCardsPrompt = (segments: SceneSegment[], bible: StyleBible, brief: ProjectBrief): string => {
  // Construct a string representation of the Continuity Bible for the prompt
  const continuityContext = Object.entries(bible.continuityBible || {})
    .map(([name, desc]) => `- \"${name}\": ${desc}`)
    .join('\n');

  return `
    You are a prompt engineer for High-End AI Image Generators (Midjourney v6, Stable Diffusion XL).
    Generate precise, descriptive prompts for video scenes.
    
    GLOBAL STYLE (Apply to ALL prompts):
    - Lighting: ${bible.lighting}
    - Camera: ${bible.camera}
    - Palette: ${bible.palette.join(', ')}
    - Global Locks: ${bible.globalLocks?.join(', ')}
    
    CONTINUITY BIBLE (Use these EXACT descriptions for subjects):
    ${continuityContext}
    
    INSTRUCTIONS:
    1. For each segment, create a "finalPositivePrompt".
    2. USE THE FORMULA: [Subject Description] + [Action/Movement] + [Environment/Background] + [Lighting/Camera] + [Style Keywords].
    3. IMPORTANT: If a segment mentions a subject from the Continuity Bible (e.g., "${Object.keys(bible.continuityBible || {}).join('", "')}"), you MUST replace the name with its full visual description provided above. NEVER use just the name.
    4. Make the prompt highly descriptive (adjectives, textures, details). 
    
    SEGMENTS TO GENERATE:
    ${JSON.stringify(segments.map(s => ({ id: s.id, intent: s.visualIntent })))} 
    
    Output strictly a JSON array:
    [
      {
        "segmentId": "SEG_xxx",
        "finalPositivePrompt": "A cute Golden Retriever dog with fluffy fur and a red bandana running joyfully through a green park, dynamic motion blur, cinematic soft lighting, 35mm lens, 8k, highly detailed, cyberpunk neon accents in background...",
        "finalNegativePrompt": "${bible.negativePrompt}",
        "globalLocks": ${JSON.stringify(bible.globalLocks || [])},
        "noTextRule": ${brief.noTextInImages ? 'true' : 'false'}
      }
    ]
    
    Do not use markdown backticks. Return RAW JSON.
  `;
};
