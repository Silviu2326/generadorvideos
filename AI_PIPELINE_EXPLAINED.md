# Pipeline de Generación de Video con IA (Explicación Técnica)

Este documento detalla el proceso fase por fase que sigue el motor de IA (`aiService.ts`) para convertir una idea simple en un proyecto de video completo.

Cada ejecución genera una carpeta de logs en `backend/logs/run_<timestamp>/` donde se guardan los inputs y outputs exactos de cada paso.

---

## Fase 1: Presupuesto (Budgeting)
**Objetivo:** Establecer límites físicos para el contenido.
*   **Input:** Duración objetivo (ej. 60s).
*   **Lógica:**
    *   Se asume una velocidad de lectura estándar (WPM) de **150 palabras por minuto**.
    *   `Target Words` = (Duración / 60) * 150.
    *   Se calculan márgenes +/- 10% (minWords, maxWords).
*   **Output:** Objeto `budget` (sin IA, puro cálculo).

## Fase 2: Estructura Maestra (Outline)
**Objetivo:** Crear el esqueleto narrativo antes de escribir el guion.
*   **Prompt (`outlinePrompt.ts`):**
    *   Actúa como "estratega de video".
    *   Recibe el `budget` y el `blueprint` (ej. Narrativo, Top 10).
    *   Debe devolver un JSON con secciones (`Hook`, `Body`, `Conclusion`), asignando a cada una un presupuesto de tiempo y palabras.
*   **Output (`02_outline.json`):** Lista de secciones con sus objetivos y puntos clave.

## Fase 3: Escritura de Guion por Bloques (Script Blocks)
**Objetivo:** Redactar el contenido hablado (voz en off o diálogo).
*   **Proceso:** Itera sobre cada sección del Outline.
*   **Prompt (`scriptPrompt.ts`):**
    *   Recibe la sección actual y el **contexto previo** (las últimas 200 letras del bloque anterior) para mantener la coherencia.
    *   Pide *solo* el texto hablado, sin acotaciones visuales aún.
*   **Output (`03_script_block_X.json`):** Texto del guion para esa sección específica.

## Fase 4: Mapa de Escenas (Scene Map)
**Objetivo:** Convertir el texto continuo en una secuencia visual temporalizada.
*   **Prompt (`sceneMapPrompt.ts`):**
    *   Recibe el guion completo generado en la fase 3.
    *   Instrucción clave: "Divide esto en segmentos visuales de 5 a 10 segundos".
    *   Debe asignar a cada segmento: `startSec`, `endSec`, `narration` (fragmento de texto exacto) y `visualIntent` (descripción de lo que se ve).
*   **Output (`04_sceneMap.json`):** Array de objetos `SceneSegment` con tiempos precisos.

## Fase 5: Biblia de Estilo (Style Bible)
**Objetivo:** Definir la dirección de arte global para garantizar consistencia visual.
*   **Prompt (`styleBiblePrompt.ts`):**
    *   Recibe el estilo visual elegido (ej. "Cyberpunk", "Acuarela").
    *   Genera reglas para: Paleta de colores, Iluminación, Tipo de cámara/lente, y "Negative Prompts" (qué evitar).
*   **Output (`05_styleBible.json`):** Objeto JSON con las directrices estéticas.

## Fase 6: Tarjetas de Prompt (Prompt Cards)
**Objetivo:** Generar las instrucciones técnicas para el generador de imágenes (Stable Diffusion/Midjourney).
*   **Prompt (`promptCardsPrompt.ts`):**
    *   Recibe el `SceneMap` (qué pasa en cada escena) y la `StyleBible` (cómo se debe ver).
    *   Combina ambos para crear un prompt de imagen detallado para cada segmento.
    *   Añade modificadores técnicos (ej. "cinematic lighting, 8k, wide shot").
*   **Output (`06_promptCards.json`):** Array de prompts listos para ser enviados a una IA generadora de imágenes.

## Fase 7: Ensamblaje (Assembly)
**Objetivo:** Empaquetar todo en un objeto final utilizable por el frontend.
*   **Proceso:** Combina todos los outputs anteriores en un objeto `ProjectPackage`.
*   **Output (`07_final_package.json`):** El JSON completo que recibe el frontend para renderizar la interfaz.

---

## Resumen del Flujo de Datos

`Brief` -> **Cálculo** -> `Budget` -> **IA** -> `Outline` -> **IA (Loop)** -> `Script` -> **IA** -> `SceneMap` + `StyleBible` -> **IA** -> `PromptCards` -> **Proyecto Final**
