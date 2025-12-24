import { ScriptBlock, VoiceProfile } from '../../../types/ai';

export const generatePolishPrompt = (blocks: ScriptBlock[], voiceProfile: VoiceProfile, language: string): string => {
  return `
    Act as a Senior Script Editor. 
    Polish the following script blocks to sound human, engaging, and rhythmically varied.
    
    TARGET LANGUAGE: ${language} (Strictly)
    
    VOICE PROFILE:
    - Tone: ${voiceProfile.tone}
    - Audience: ${voiceProfile.audience}
    - Style Rules: ${voiceProfile.styleRules.join(', ')}
    
    BANNED PHRASES (REMOVE/REWRITE):
    ${voiceProfile.bannedPhrases.join(', ')}
    ${voiceProfile.bannedCliches.join(', ')}
    
    INPUT BLOCKS:
    ${JSON.stringify(blocks.map(b => ({ id: b.sectionId, text: b.text })))}
    
    INSTRUCTIONS:
    1. Iterate through each block.
    2. REWRITE the text to improve flow, remove repetition, and eliminate AI-sounding phrasing.
    3. Remove any meta-commentary ("In this video...", "As we can see...").
    4. Ensure the meaning remains the same.
    5. KEEP IT CONCISE. If a block feels too long, CONDENSE it.
    6. Generate "voiceStyleInstructions" describing how the voice actor should perform the ENTIRE script.
    
    IMPORTANT:
    - Output MUST be valid JSON.
    - ESCAPE all double quotes inside the text strings (e.g., use \\" instead of ").
    - Do not include markdown formatting (like code blocks) in the response if possible, just the raw JSON string.
    
    OUTPUT JSON OBJECT:
    {
      "voiceStyleInstructions": "Detailed instructions for the voice actor...",
      "polishedBlocks": [
        { "id": "S1", "text": "Polished text here with \\"escaped quotes\\" if needed..." },
        { "id": "S2", "text": "Polished text here..." }
      ]
    }
  `;
};
