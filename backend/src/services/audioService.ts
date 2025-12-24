import { aiClient } from '../config/gemini';
import { SceneSegment, ProjectBrief, ProjectPackage } from '../types/ai';

export const audioService = {
  generateFullScriptAudio: async (
    scenes: SceneSegment[],
    packageData: ProjectPackage
  ): Promise<string | null> => {
    if (!aiClient) throw new Error("AI Client not initialized");

    const globalInstructions = packageData.voiceStyleInstructions || "Clear and professional narration.";
    const voiceName = "Schedar"; // Requested voice
    const modelName = "models/gemini-2.5-pro-preview-tts"; // Requested model

    console.log(`[AudioService] Starting generation for ${scenes.length} scenes.`);
    console.log(`[AudioService] Model: ${modelName}, Voice: ${voiceName}`);
    console.log(`[AudioService] Instructions: ${globalInstructions}`);

    const audioBuffers: Buffer[] = [];

    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        if (!scene.narration || scene.narration.trim().length === 0) {
            console.log(`[AudioService] Skipping Scene ${scene.id} (empty narration).`);
            continue;
        }

        console.log(`[AudioService] Generating audio for Scene ${scene.id} (${i+1}/${scenes.length})...`);
        console.log(`[AudioService] Text: "${scene.narration.substring(0, 50)}..."`);

        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
            try {
                const response = await aiClient.models.generateContent({
                    model: modelName,
                    contents: [{
                        role: 'user',
                        parts: [{ text: `
                          Read this specific scene text.
                          Style: "${globalInstructions}".
                          
                          Text:
                          ${scene.narration}
                        `}] 
                    }],
                    config: {
                        responseModalities: ["AUDIO"], 
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: voiceName
                                }
                            }
                        }
                    } as any 
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                
                if (part && (part.inlineData || (part as any).audio?.data)) {
                    const base64Audio = part.inlineData?.data || (part as any).audio?.data;
                    if (base64Audio) {
                         const buffer = Buffer.from(base64Audio, 'base64');

                         // Log first few bytes to diagnose format
                         const headerHex = buffer.slice(0, 16).toString('hex');
                         console.log(`[AudioService] Scene ${scene.id} audio header: ${headerHex}`);

                         audioBuffers.push(buffer);
                         console.log(`[AudioService] Scene ${scene.id} audio generated (${buffer.length} bytes).`);
                         success = true;
                    } else {
                        console.warn(`[AudioService] Scene ${scene.id} returned empty audio data. Retrying...`);
                    }
                } else {
                     console.warn(`[AudioService] No audio part in response for Scene ${scene.id}. Retrying...`);
                }

            } catch (error) {
                console.error(`[AudioService] Failed to generate audio for Scene ${scene.id} (Retries left: ${retries - 1}):`, error);
            }
            
            if (!success) {
                retries--;
                if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s before retry
            }
        }
        
        if (!success) {
             console.error(`[AudioService] PERMANENT FAILURE for Scene ${scene.id}. Audio will be missing for this segment.`);
        }
    }

    if (audioBuffers.length === 0) {
        console.warn("[AudioService] No audio generated for any scene.");
        return null;
    }

    console.log(`[AudioService] Concatenating ${audioBuffers.length} audio segments...`);

    // Log individual buffer sizes
    audioBuffers.forEach((buf, idx) => {
        console.log(`[AudioService] Buffer ${idx}: ${buf.length} bytes, starts with: ${buf.slice(0, 4).toString('hex')}`);
    });

    // Simple concatenation of MP3 buffers.
    // Note: This creates a valid streamable MP3 but might have minor artifacts at boundaries
    // compared to re-encoding, but is efficient and deps-free.
    const finalBuffer = Buffer.concat(audioBuffers);

    console.log(`[AudioService] Final Audio Size: ${finalBuffer.length} bytes.`);
    console.log(`[AudioService] Final buffer starts with: ${finalBuffer.slice(0, 16).toString('hex')}`);
    console.log(`[AudioService] Final buffer ends with: ${finalBuffer.slice(-16).toString('hex')}`);

    // TEMPORARY: Return just the first scene's audio to test if individual scenes work
    if (audioBuffers.length === 1) {
        console.log(`[AudioService] Single scene - returning directly.`);
        return `data:audio/mpeg;base64,${audioBuffers[0].toString('base64')}`;
    }

    return `data:audio/mpeg;base64,${finalBuffer.toString('base64')}`;
  }
};
