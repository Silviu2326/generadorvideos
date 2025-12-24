import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { aiService } from '../services/aiService';
import { ProjectBrief } from '../types/ai';
import fs from 'fs';
import path from 'path';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
// Initialize client only if key exists, otherwise let it fail gracefully or warn
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateScript = async (req: Request, res: Response) => {
  console.log("POST /api/ai/generate-script hit");
  console.log("Request body:", req.body);

  if (!client) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { title, description, format, duration, style, voice, language } = req.body;

  const prompt = `
    Act as a professional video director and scriptwriter.
    Create a structured video script for the following project:
    
    Title: ${title}
    Description/Objective: ${description}
    Format: ${format}
    Target Duration: ${duration}
    Visual Style: ${style}
    Voice/Tone: ${voice}
    Language: ${language}

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
    . Just the raw JSON array.
  `;

  try {
    const response = await client.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Or 'gemini-1.5-flash'
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
        return res.status(500).json({ error: "No content generated from AI" });
    }

    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const json = JSON.parse(cleanedText);
        console.log("AI Script generated successfully:", json.length, "scenes");
        res.json(json);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Raw Text:", cleanedText);
        res.status(500).json({ error: "Failed to parse AI response as JSON", raw: cleanedText });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const generateFullProject = async (req: Request, res: Response) => {
  try {
    const brief: ProjectBrief = req.body;
    
    // Default values if missing
    if (!brief.blueprint) brief.blueprint = 'narrative';
    if (!brief.targetDurationSec) brief.targetDurationSec = 60;

    const result = await aiService.generateFullProject(brief);
    
    // DEBUG: Save the response to a file in the backend root
    try {
        const debugPath = path.join(process.cwd(), 'last_full_project_response.json');
        fs.writeFileSync(debugPath, JSON.stringify(result, null, 2));
        console.log(`Debug: Full project response saved to ${debugPath}`);
    } catch (err) {
        console.error("Debug: Failed to save response file", err);
    }

    res.json(result);
  } catch (error: any) {
    console.error("Full Project Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate project" });
  }
};

export const generateVisuals = async (req: Request, res: Response) => {
  try {
    const packageData = req.body;
    const result = await aiService.generateVisuals(packageData);
    res.json(result);
  } catch (error: any) {
    console.error("Visuals Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate visuals" });
  }
};

export const generateAudio = async (req: Request, res: Response) => {
  try {
    const packageData = req.body;
    const result = await aiService.generateAudio(packageData);
    res.json(result);
  } catch (error: any) {
    console.error("Audio Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate audio" });
  }
};