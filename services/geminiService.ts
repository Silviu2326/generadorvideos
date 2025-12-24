import { GoogleGenAI } from "@google/genai";

// This service will be expanded for video generation
// It currently handles the API key requirement for Veo models

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return false;
};

export const openApiKeySelector = async (): Promise<void> => {
   if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

let aiClient: GoogleGenAI | null = null;

export const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
     // The key is injected via process.env.API_KEY by the environment wrapper
     // after the user selects it via the aistudio interface.
     // Fallback to a placeholder if not found, handling logic should be in the caller
     const apiKey = process.env.API_KEY || (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) || '';
     aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export interface ScriptParams {
  title: string;
  description: string;
  format: string;
  duration: string;
  style: string;
  voice: string;
  language: string;
}

export interface ScriptScene {
  scene: number;
  duration: string;
  visual: string;
  audio: string;
}

export const generateScript = async (params: ScriptParams): Promise<ScriptScene[]> => {
  const client = getAiClient();
  
  const prompt = `
    Act as a professional video director and scriptwriter.
    Create a structured video script for the following project:
    
    Title: ${params.title}
    Description/Objective: ${params.description}
    Format: ${params.format}
    Target Duration: ${params.duration}
    Visual Style: ${params.style}
    Voice/Tone: ${params.voice}
    Language: ${params.language}

    Output format: JSON Array ONLY.
    Structure per item:
    {
      "scene": number,
      "duration": "mm:ss" (e.g., "0:05"),
      "visual": "Detailed visual description matching the style",
      "audio": "Voiceover (VO), Dialogue, or Sound Effects (SFX)"
    }

    Ensure the total duration roughly matches the target. Split into dynamic scenes.
    Do not include markdown backticks like 
    Just the raw JSON array.
  `;

  try {
    // Note: Adjust model name as needed (e.g., "gemini-1.5-flash" or "gemini-2.0-flash-exp")
    // The SDK usage here assumes the new @google/genai generic client pattern
    // If using the specific 'generative-ai' package, syntax is slightly different.
    // Assuming the setup in package.json implies the standard Generative AI access.
    
    // We'll try to use a standard accessible model
    const response = await client.models.generateContent({
        model: 'gemini-2.0-flash-exp', 
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("No content generated");

    // Clean up potential markdown formatting if the model disregards instructions
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText) as ScriptScene[];
  } catch (error) {
    console.error("Gemini Script Generation Error:", error);
    // Fallback or re-throw
    throw error;
  }
};

// Placeholder for future video generation
export const generateVideo = async (prompt: string) => {
    const client = getAiClient();
    console.log("Generating video for:", prompt);
    // ... logic
};
