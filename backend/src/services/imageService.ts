import { aiClient } from '../config/gemini';
import { SceneSegment, StyleBible, ProjectBrief } from '../types/ai';

export const imageService = {
  generateSceneImages: async (
    scenes: SceneSegment[], 
    styleBible: StyleBible, 
    brief: ProjectBrief
  ): Promise<SceneSegment[]> => {
    if (!aiClient) throw new Error("AI Client not initialized");

    const updatedScenes = [...scenes];
    
    // 1. Construct the Consistency Prompt (The "Anchor")
    // This ensures all images look like they belong to the same movie/video.
    const consistencyPrompt = `
      STYLE: ${brief.visualStyle}.
      PALETTE: ${styleBible.palette.join(', ')}.
      LIGHTING: ${styleBible.lighting}.
      CAMERA: ${styleBible.camera}.
      MAIN CHARACTER: ${styleBible.continuityBible ? Object.values(styleBible.continuityBible).join('; ') : 'None'}.
    `.trim();

    console.log("Generating images with Consistency Anchor:", consistencyPrompt);

    // 2. Generate Images in Parallel (limited concurrency to avoid rate limits)
    // For now, we'll do sequential or small batches.
    for (let i = 0; i < updatedScenes.length; i++) {
      const scene = updatedScenes[i];
      const prompt = `
        ${consistencyPrompt}
        
        SCENE ACTION: ${scene.visualIntent}
        
        NO TEXT. HIGH QUALITY. CINEMATIC.
      `.trim();

      try {
        console.log(`Generating image for Scene ${scene.id}...`);
        
        // Using "imagen-4.0-generate-001" (Imagen 4) which is the high-fidelity model supporting 'predict'
        // "Nano Banana Pro" (gemini-3-pro-image-preview) does not support 'predict' via generateImages.
        const response = await aiClient.models.generateImages({
          model: 'imagen-4.0-fast-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: brief.format === '16:9' ? '16:9' : brief.format === '9:16' ? '9:16' : '1:1',
          }
        });

        const image = response.generatedImages?.[0]; // Correct property for newer SDK
        
        if (image && image.image?.imageBytes) {
           scene.imageUrl = `data:image/png;base64,${image.image.imageBytes}`;
        } else {
           console.warn(`No image returned for Scene ${scene.id}`);
        }

      } catch (error) {
        console.error(`Failed to generate image for Scene ${scene.id}:`, error);
        // Optional: Set a placeholder or error image
      }
    }

    return updatedScenes;
  }
};
