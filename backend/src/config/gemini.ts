import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured.');
}

export const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
export const MODEL_NAME = 'gemini-3-flash-preview'; // Or 'gemini-1.5-flash'
