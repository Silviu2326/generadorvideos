import { ScriptBlock } from '../../../types/ai';

export const generateSceneMapPrompt = (blocks: ScriptBlock[], totalDuration: number): string => {
  return `
    Convert the script into a timed SCENE MAP.
    Split into segments of 5-10 seconds.
    
    TOTAL TARGET DURATION: ${totalDuration} seconds (STRICT).
    
    SCRIPT BLOCKS:
    ${JSON.stringify(blocks.map(b => ({ id: b.sectionId, text: b.text })))}
    
    Output strictly a JSON array of objects:
    [
      {
        "id": "SEG_001",
        "sectionId": "S1",
        "startSec": 0,
        "endSec": 8,
        "narration": "Text spoken...",
        "visualIntent": "Visual description...",
        "shotType": "broll",
        "beatType": "hook", 
        "visualRole": "establishing",
        "continuityTags": ["loc:studio", "light:soft"]
      }
    ]
    
    FIELDS:
    - beatType options: hook, explanation, example, transition, cta.
    - visualRole options: establishing, supporting, recap, cta.
    - sectionId: Must match the script block ID provided.
    
    CRITICAL INSTRUCTIONS:
    1. Ensure IDs are sequential (SEG_001, SEG_002...).
    2. Ensure startSec/endSec are continuous (no gaps).
    3. The FINAL segment's 'endSec' MUST be exactly ${totalDuration}. Adjust pacing if needed.
    
    Do not use markdown backticks. Return RAW JSON.
  `;
};
