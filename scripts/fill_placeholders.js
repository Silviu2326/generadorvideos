import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'style_previews');

const missingStyles = [
    'comic', 'kirby', 'noir', 'moebius', 
    'retro', 'polaroid', 'vaporwave', 'rubberhose'
];

const sourceImage = path.join(OUTPUT_DIR, 'realistic_1.png');

if (!fs.existsSync(sourceImage)) {
    console.error("Source image not found!");
    process.exit(1);
}

missingStyles.forEach(style => {
    for (let i = 1; i <= 3; i++) {
        const destFile = path.join(OUTPUT_DIR, `${style}_${i}.png`);
        if (!fs.existsSync(destFile)) {
            fs.copyFileSync(sourceImage, destFile);
            console.log(`Created placeholder for ${style}_${i}.png`);
        }
    }
});
