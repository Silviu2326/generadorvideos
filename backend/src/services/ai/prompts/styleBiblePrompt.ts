import { ProjectBrief } from '../../../types/ai';

export const generateStyleBiblePrompt = (brief: ProjectBrief): string => {
  return `
    Create a Detailed Visual Style Bible for a video project.
    
    PROJECT INFO:
    Title: ${brief.title}
    Goal: ${brief.goal}
    Style: ${brief.visualStyle}
    Format: ${brief.format}
    
    TASK:
    1. Define the global aesthetic (Palette, Lighting, Camera).
    2. Identify the MAIN SUBJECTS (Characters, Objects, Locations) that appear repeatedly.
    3. Define a "Continuity String" for each subject. This string MUST be used in every prompt where the subject appears to ensure they look identical.
    
    Output strictly a JSON object:
    {
      "palette": ["Hex/Color 1", "Hex/Color 2", "Hex/Color 3"],
      "lighting": "Detailed description of lighting (e.g., 'Cinematic soft lighting with rim light, volumetric fog')",
      "camera": "Camera choice (e.g., 'Shot on 35mm lens, f/1.8, bokeh effect')",
      "negativePrompt": "Universal negative prompt (e.g., 'text, watermark, ugly, distorted, blurry, low quality')",
      "globalLocks": ["Key style element 1", "Key style element 2"],
      "continuityBible": {
        "MainCharacterName": "Full visual description (e.g., 'A cute Golden Retriever dog named Mike with fluffy fur and a red bandana')",
        "LocationName": "Visual description of main setting"
      },
      "promptTemplate": "Use this structure: [Subject Description] [Action] [Environment], [Lighting], [Camera], [Palette/Style]"
    }
    
    Do not use markdown backticks. Return RAW JSON.
  `;
};