import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Configuración
const TIMEOUT_MINUTES = 9;
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;
const JSON_FILE = process.argv[2] || 'prompts_input.json'; // Se puede pasar como argumento

// Función para ejecutar un solo prompt
function runPrompt(promptText, index, total) {
    return new Promise((resolve) => {
        console.log(`
==================================================`);
        console.log(`[${index + 1}/${total}] Iniciando tarea: "${promptText.substring(0, 50)}"...`);
        console.log(`==================================================`);

        // Construir el comando y argumentos
        // gemini --yolo --model gemini-3-pro-preview "Prompt text..."
        const command = 'gemini';
        // En Windows con shell: true, es más seguro pasar el prompt entre comillas dobles explícitas
        // para evitar que se interprete como múltiples argumentos.
        const safePrompt = `"${promptText.replace(/"/g, '\\"')}"`;
        const args = ['--yolo', '--model', 'gemini-3-pro-preview', safePrompt];

        const start = Date.now();
        
        // Ejecutar el comando
        // shell: true es necesario en Windows para comandos globales
        const child = spawn(command, args, { shell: true, stdio: 'inherit' });
        
        let timedOut = false;

        // Temporizador de seguridad (9 minutos)
        const timer = setTimeout(() => {
            timedOut = true;
            console.error(`
[!] TEMA DE TIEMPO: La tarea ha excedido los ${TIMEOUT_MINUTES} minutos. Cerrando proceso...`);
            
            // Intentar matar el proceso
            // En Windows, a veces spawn con shell crea una jerarquía, pero kill() suele funcionar
            // Si falla, se podría necesitar 'taskkill'
            try {
                process.kill(child.pid); // Señal SIGTERM por defecto
                // Refuerzo para Windows si es necesario
                spawn('taskkill', ['/pid', child.pid, '/f', '/t']);
            } catch (e) {
                console.error('Error al intentar matar el proceso:', e.message);
            }
            
            resolve({ status: 'timeout' });
        }, TIMEOUT_MS);

        // Evento cuando el proceso termina por sí mismo
        child.on('close', (code) => {
            if (!timedOut) {
                clearTimeout(timer);
                const duration = ((Date.now() - start) / 1000).toFixed(2);
                console.log(`
[OK] Tarea finalizada en ${duration}s con código: ${code}`);
                resolve({ status: 'completed', code });
            }
        });

        // Manejo de errores de inicio
        child.on('error', (err) => {
            if (!timedOut) {
                clearTimeout(timer);
                console.error(`
[ERROR] No se pudo iniciar el proceso: ${err.message}`);
                resolve({ status: 'error', error: err });
            }
        });
    });
}

// Función principal
async function main() {
    const inputPath = path.resolve(process.cwd(), JSON_FILE);

    if (!fs.existsSync(inputPath)) {
        console.error(`Error: No se encuentra el archivo ${inputPath}`);
        console.log('Uso: node scripts/runner_gemini.js <archivo_prompts.json>');
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(inputPath, 'utf-8');
        const prompts = JSON.parse(rawData);

        if (!Array.isArray(prompts)) {
            throw new Error('El JSON debe contener un array de objetos.');
        }

        console.log(`Cargados ${prompts.length} prompts para procesar.`);

        for (let i = 0; i < prompts.length; i++) {
            const item = prompts[i];
            // Aseguramos obtener el texto del prompt, ya sea que venga como string o { prompt: "..." }
            const promptText = typeof item === 'string' ? item : (item.prompt || item.text);

            if (!promptText) {
                console.warn(`[WARN] Elemento ${i} no tiene campo 'prompt' válido. Saltando.`);
                continue;
            }

            await runPrompt(promptText, i, prompts.length);
        }

        console.log('\nTodas las tareas han sido procesadas.');

    } catch (error) {
        console.error('Error procesando el script:', error.message);
    }
}

main();