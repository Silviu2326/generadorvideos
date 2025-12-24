import dotenv from 'dotenv';
import path from 'path';

// 1. Load .env BEFORE importing gemini configuration
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function listModels() {
  // 2. Dynamic import to ensure env vars are set first
  const { aiClient } = await import('../config/gemini');

  if (!aiClient) {
    console.error("AI Client not initialized (Check GEMINI_API_KEY)");
    return;
  }
  try {
    const response = await aiClient.models.list();
    if (response) {
        console.log("Available Models:");
        for await (const model of response) {
             console.log(JSON.stringify(model, null, 2));
        }
    } else {
        console.log("No models found.");
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();