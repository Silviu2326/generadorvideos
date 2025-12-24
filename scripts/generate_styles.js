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

console.log(`Using API Key: ${apiKey.substring(0, 8)}...`);

const client = new GoogleGenAI({ apiKey });

// Styles Definition (Synced with NewProjectWizard.tsx)
const styles = [
    // --- REALISMO & CINEMÁTICO ---
    { id: 'realistic', name: 'Fotorealista', desc: 'Alta fidelidad, 8k, RAW. Estilo fotografía pura. Lentes 85mm, iluminación natural.' },
    { id: 'cinematic', name: 'Cinemático', desc: 'Hollywood, Color Grading. Teal & Orange, anamórfico, profundidad de campo, dramático.' },
    { id: 'documentary', name: 'Documental', desc: 'NatGeo, BBC Earth. Realismo crudo, luz natural, texturas detalladas, observacional.' },
    { id: 'b&w_noir', name: 'Film Noir B&W', desc: 'Alto contraste, años 40. Luces y sombras duras, misterio, humo, siluetas.' },
    { id: 'drone', name: 'Aéreo / Drone', desc: 'Vista de pájaro, gran escala. Paisajes épicos, tomas cenitales, majestuoso.' },

    // --- ANIME & MANGA ---
    { id: 'ghibli', name: 'Studio Ghibli', desc: 'Miyazaki, Tradicional. Colores vibrantes, naturaleza exuberante, nubes detalladas, nostálgico.' },
    { id: 'makoto', name: 'Makoto Shinkai', desc: 'Your Name, Hiper-detalle. Iluminación mágica, destellos, cielos estrellados, ultra detallado.' },
    { id: 'akira', name: 'Retro 80s / Akira', desc: 'Cyberpunk clásico, Cel. Dibujado a mano, estética sucia, neones, metrópolis detallada.' },
    { id: 'kawaii', name: 'Anime Moderno', desc: 'Shonen / Shojo actual. Líneas limpias, colores saturados, ojos grandes, estilo TV actual.' },
    { id: 'manga', name: 'Manga B&W', desc: 'Tinta, Tramas, Papel. Blanco y negro, tramas de puntos, líneas de acción, entintado.' },

    // --- ARTE CLÁSICO ---
    { id: 'watercolor', name: 'Acuarela', desc: 'Suave, Fluido, Artístico. Manchas de color, papel texturizado, bordes difusos, etéreo.' },
    { id: 'oil', name: 'Óleo Impresionista', desc: 'Van Gogh, Monet. Pinceladas visibles, textura empastada, luz vibrante.' },
    { id: 'surreal', name: 'Surrealismo', desc: 'Dalí, Magritte. Onírico, objetos imposibles, paisajes desolados, misterioso.' },
    { id: 'ukiyo', name: 'Ukiyo-e Japonés', desc: 'Hokusai, Grabado. Estilo "La Gran Ola", líneas planas, colores tradicionales.' },
    { id: 'renaissance', name: 'Renacimiento', desc: 'Da Vinci, Michelangelo. Composición clásica, claroscuro, anatomía idealizada, divino.' },

    // --- DIGITAL & 3D ---
    { id: '3d', name: '3D Pixar/Disney', desc: 'CGI, Render Clean. Iluminación global, formas suaves, colores brillantes, amigable.' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', desc: 'Neon, Lluvia, Futuro. Alta tecnología, baja vida. Cromados, luces de neón, noche.' },
    { id: 'lowpoly', name: 'Low Poly', desc: 'Minimalista, Geométrico. Polígonos visibles, colores planos, estilo videojuego indie.' },
    { id: 'unreal', name: 'Unreal Engine 5', desc: 'Next-Gen Game. Ray tracing, texturas 4k, realismo digital extremo.' },
    { id: 'pixel', name: 'Pixel Art', desc: '8-bit / 16-bit. Retro gaming, sprites, paleta de colores limitada.' },
    { id: 'clay', name: 'Claymation', desc: 'Aardman, Stop Motion. Plastilina, texturas táctiles, iluminación de estudio pequeña.' },

    // --- CÓMICS ---
    { id: 'comic', name: 'Cómic Moderno', desc: 'Marvel/DC Actual. Color digital, líneas dinámicas, acción.' },
    { id: 'kirby', name: 'Jack Kirby', desc: 'Retro Marvel Bold. Kirby Krackle, poses exageradas, colores primarios, años 60/70.' },
    { id: 'noir', name: 'Sin City / Noir', desc: 'Frank Miller Style. Alto contraste B&N, acentos rojos, sombras sólidas.' },
    { id: 'moebius', name: 'Moebius', desc: 'Sci-Fi Francés. Líneas finas, colores pastel, mundos alienígenas surrealistas.' },

    // --- VINTAGE & RETRO ---
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

async function generateImage(prompt, filename) {
    const fullPrompt = `${prompt}`;
    const filePath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${filename} (already exists)`);
        return;
    }

    console.log(`Generating ${filename}...`);
    
    const modelsToTry = ['imagen-4.0-fast-generate-001', 'imagen-3.0-generate-001'];
    
    for (const model of modelsToTry) {
        try {
            console.log(`Trying model: ${model}`);
            const response = await client.models.generateImages({
                model: model,
                prompt: fullPrompt,
                config: {
                    aspectRatio: '16:9',
                    numberOfImages: 1
                }
            });

            // Inspect response structure
            let imgData = null;
            
            // @google/genai v1.0+ structure might vary
            if (response.generatedImages && response.generatedImages[0]) {
                 imgData = response.generatedImages[0].image.imageBytes;
            } else if (response.predictions && response.predictions[0]) {
                 imgData = response.predictions[0].bytesBase64Encoded;
            } else if (response.image?.imageBytes) {
                 imgData = response.image.imageBytes; // Single image response
            } else if (Array.isArray(response) && response[0]) {
                 // Sometimes it returns the image directly? unlikely
            }

            if (imgData) {
                const buffer = Buffer.from(imgData, 'base64');
                fs.writeFileSync(filePath, buffer);
                console.log(`Saved ${filename} using ${model}`);
                return; // Success, exit function
            } else {
                console.warn(`Model ${model} returned no image data:`, JSON.stringify(response).substring(0, 200));
            }
            
        } catch (error) {
            console.error(`Error with ${model}:`, error.message);
            // Continue to next model
        }
    }
    
    console.error(`Failed to generate ${filename} with all models.`);
}

async function run() {
    console.log(`Starting generation for ${styles.length} styles x 3 images...`);
    
    for (const style of styles) {
        console.log(`\n--- Processing Style: ${style.name} ---`);
        
        for (const subject of subjects) {
            const prompt = `Style: ${style.name}. ${style.desc}. Subject: ${subject.prompt}. High quality, detailed.`;
            const filename = `${style.id}${subject.suffix}.png`;
            
            await generateImage(prompt, filename);
            // Brief pause to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
    }
    console.log("\nDone!");
}

run();
