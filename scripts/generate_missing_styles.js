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

// Styles to retry/finish
const stylesToProcess = [
    { id: '3d', name: '3D Pixar/Disney', desc: 'CGI, Render Clean. Iluminación global, formas suaves, colores brillantes, amigable.' }, // Filling missing 2
    { id: 'lowpoly', name: 'Low Poly', desc: 'Minimalista, Geométrico. Polígonos visibles, colores planos, estilo videojuego indie.' }, // Filling missing 3
    { id: 'unreal', name: 'Unreal Engine 5', desc: 'Next-Gen Game. Ray tracing, texturas 4k, realismo digital extremo.' },
    { id: 'pixel', name: 'Pixel Art', desc: '8-bit / 16-bit. Retro gaming, sprites, paleta de colores limitada.' },
    { id: 'clay', name: 'Claymation', desc: 'Aardman, Stop Motion. Plastilina, texturas táctiles, iluminación de estudio pequeña.' },
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
    { suffix: '_1', prompt: "A majestic landscape or sprawling city, wide shot" },
    { suffix: '_2', prompt: "A close-up character portrait, detailed face, intense expression" },
    { suffix: '_3', prompt: "A dynamic action scene or intricate object detail, cinematic angle" }
];

async function generateImage(style, subject) {
    const filename = `${style.id}${subject.suffix}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${filename} (already exists)`);
        return;
    }

    const fullPrompt = `Style: ${style.name}. ${style.desc}. Subject: ${subject.prompt}. High quality, detailed.`;
    console.log(`Generating ${filename}...`);
    
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
            // Silent catch to try next model
        }
    }
    console.error(`Failed to generate ${filename}`);
}

async function run() {
    console.log(`Filling missing images...`);
    
    for (const style of stylesToProcess) {
        for (const subject of subjects) {
            await generateImage(style, subject);
            await new Promise(resolve => setTimeout(resolve, 800)); // Slightly faster
        }
    }
    console.log("\nDone filling gaps!");
}

run();
