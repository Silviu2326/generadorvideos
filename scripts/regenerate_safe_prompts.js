import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'style_previews');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const envPath = path.join(ROOT_DIR, 'backend', '.env');
let apiKey = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY not found in backend/.env");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey });

// Map styles to "safe" descriptive prompts that avoid specific trademarked names but describe the visual aesthetic
const stylePrompts = {
    'comic': "Modern superhero comic book art style, digital coloring, dynamic action lines, high contrast, detailed character shading, vibrant colors.",
    'kirby': "Retro 1970s cosmic comic book art, bold black outlines, exaggerated poses, energy crackle effects, machinery details, primary colors, cosmic dots background.",
    'noir': "High contrast black and white comic art, dramatic shadows, silhouette style, moody atmosphere, ink wash texture, graphic novel aesthetic.",
    'moebius': "European sci-fi comic art, fine line work, pastel colors, surreal desert landscapes, intricate details, clean lines, atmospheric and dreamlike.",
    'retro': "Vintage 1990s home video footage aesthetic, slight tracking error, color noise, low resolution VHS texture, timestamp in corner, nostalgic vibe.",
    'polaroid': "Instant camera photography style, soft focus, slightly washed out colors, high flash exposure, vintage photo texture, candid moment.",
    'vaporwave': "Digital surrealism, retro 1980s computer graphics, pink and cyan color palette, greek statues, grid patterns, neon lights, nostalgic digital art.",
    'rubberhose': "1930s black and white cartoon style, vintage animation, characters with noodle limbs, pie-cut eyes, grainy film texture, bouncy animation frame."
};

const subjects = [
    { suffix: '_1', prompt: "A wide shot of a futuristic or fantasy city" },
    { suffix: '_2', prompt: "A close-up portrait of a hero or character" },
    { suffix: '_3', prompt: "An action scene with dynamic movement" }
];

async function generateImage(styleId, safePrompt, subject) {
    const filename = `${styleId}${subject.suffix}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);

    const fullPrompt = `${safePrompt} Subject: ${subject.prompt}. High quality, visually striking.`;
    console.log(`Generating ${filename} with prompt: "${safePrompt.substring(0, 50)}"...`);
    
    // Trying 3.0 first as it is generally more stable for general image gen
    const modelsToTry = ['imagen-3.0-generate-001', 'imagen-4.0-fast-generate-001'];
    
    for (const model of modelsToTry) {
        try {
            const response = await client.models.generateImages({
                model: model,
                prompt: fullPrompt,
                config: {
                    aspectRatio: '16:9',
                    numberOfImages: 1
                }
            });

            let imgData = null;
            if (response.generatedImages && response.generatedImages[0]) {
                 imgData = response.generatedImages[0].image.imageBytes;
            } else if (response.predictions && response.predictions[0]) {
                 imgData = response.predictions[0].bytesBase64Encoded;
            } else if (response.image?.imageBytes) {
                 imgData = response.image.imageBytes;
            }

            if (imgData) {
                const buffer = Buffer.from(imgData, 'base64');
                fs.writeFileSync(filePath, buffer);
                console.log(`> Success: Saved ${filename}`);
                return; 
            }
        } catch (error) {
           // console.log(`  > Failed with ${model}`);
        }
    }
    console.error(`> Failed to generate ${filename} after all attempts.`);
}

async function run() {
    console.log(`Starting generation with descriptive prompts...`);
    
    for (const [styleId, safePrompt] of Object.entries(stylePrompts)) {
        console.log(`
--- Style: ${styleId} ---`);
        for (const subject of subjects) {
            await generateImage(styleId, safePrompt, subject);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Respectful delay
        }
    }
    console.log("\nDone!");
}

run();
