import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'style_previews');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read API Key from backend/.env
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

// Only the missing styles requested by user
const stylesToProcess = [
    { id: 'comic', name: 'Cómic Moderno', desc: 'Marvel/DC Actual. Color digital, líneas dinámicas, acción.' },
    { id: 'kirby', name: 'Jack Kirby', desc: 'Retro Marvel Bold. Kirby Krackle, poses exageradas, colores primarios, años 60/70.' },
    { id: 'noir', name: 'Sin City / Noir', desc: 'Frank Miller Style. Alto contraste B&N, acentos rojos, sombras sólidas.' },
    { id: 'moebius', name: 'Moebius', desc: 'Sci-Fi Francés. Líneas finas, colores pastel, mundos alienígenas surrealistas.' },
    { id: 'retro', name: 'VHS 90s', desc: 'Glitch & Noise. Aberración cromática, scanlines, baja resolución, home video.' },
    { id: 'polaroid', name: 'Polaroid', desc: 'Instantánea Vintage. Colores lavados, flash directo, viñeteado, nostálgico.' },
    { id: 'vaporwave', name: 'Vaporwave', desc: 'Aesthetics 80s/90s. Rosa y cian, estatuas griegas, delfines, surrealismo digital retro.' },
    { id: 'rubberhose', name: 'Cartoons 1930s', desc: 'Cuphead / Disney Old. Rubber hose, blanco y negro, granulosidad, animación de manguera.' }
];

const subjects = [
    { suffix: '_1', prompt: "A majestic landscape or city scene" },
    { suffix: '_2', prompt: "A close-up character portrait" },
    { suffix: '_3', prompt: "An action scene or detailed object" }
];

async function generateImage(style, subject) {
    const filename = `${style.id}${subject.suffix}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);

    // Force regenerate even if exists (since they are currently placeholders)
    // To be safe, we check if file size is identical to our 'placeholder' source (realistic_1.png)
    // But easier logic: just overwrite them since the user specifically asked for real ones.
    
    const fullPrompt = `Style: ${style.name}. ${style.desc}. Subject: ${subject.prompt}. High quality, artistic masterpiece.`;
    console.log(`Generating real image for ${filename}...`);
    
    // Using imagen-3.0-generate-001 as primary here for reliability on artistic styles
    // Or 4.0 if preferred.
    const modelsToTry = ['imagen-4.0-fast-generate-001', 'imagen-3.0-generate-001'];
    
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
                console.log(`Saved ${filename} using ${model}`);
                return; 
            }
        } catch (error) {
            // console.error(`Error with ${model}:`, error.message);
        }
    }
    console.error(`Failed to generate ${filename}`);
}

async function run() {
    console.log(`Starting forced regeneration for comic/retro styles...`);
    
    for (const style of stylesToProcess) {
        console.log(`--- Style: ${style.name} ---`);
        for (const subject of subjects) {
            await generateImage(style, subject);
            // Throttle to be kind to the API
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    console.log("\nDone regenerating specific styles!");
}

run();
