import { ProjectBrief, OutlineSection } from '../../../types/ai';

export const generateEntitiesPrompt = (brief: ProjectBrief, outlineSections: OutlineSection[]): string => {
  return `
    Act as a Casting Director and Production Designer.
    Define the "Entities Lock" for this video project.
    
    PROJECT:
    Title: ${brief.title}
    Goal: ${brief.goal}
    Style: ${brief.visualStyle}
    
    OUTLINE SUMMARY:
    ${outlineSections.map(s => `- ${s.title}: ${s.goal}`).join('\n')}
    
    INSTRUCTIONS:
    Identify 3-5 key recurring entities (characters, locations, or key objects) that appear in the video.
    Assign them a FINAL name and a consistent visual description.
    
    OUTPUT JSON ARRAY ONLY:
    [
      {
        "name": "Myke",
        "type": "character",
        "description": "Small Jack Russell Terrier, white with brown patch, red bandana, energetic."
      },
      {
        "name": "The Neighborhood",
        "type": "location",
        "description": "Sunny suburban street, colorful houses, clean sidewalks, golden hour lighting."
      }
    ]
    
    RULES:
    - If the user mentioned specific names in the title/goal, USE THEM.
    - If no names were provided, INVENT suitable names (e.g., "Doña Garcia", "The Magic Whistle").
    - Descriptions must be visual and suitable for image generation prompts later.
  `;
};
