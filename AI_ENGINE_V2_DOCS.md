# Creator Studio AI Engine V2 - Manual Técnico Completo

**Versión:** 2.1 (Arquitectura de Blueprints & Pipeline Estructurado)
**Fecha:** Diciembre 2025
**Estado:** Producción

---

## 1. Introducción y Filosofía

El **AI Engine V2** no es simplemente un generador de scripts. Es un **orquestador creativo** diseñado para resolver los problemas comunes de la generación de video con IA: falta de coherencia narrativa, pérdida de contexto en videos largos, alucinaciones visuales y falta de estructura.

### Principios Core
1.  **Divide y Vencerás:** No se pide "un video" en un solo prompt. Se divide el proceso en 7 fases discretas, donde la salida de una es la entrada estricta de la siguiente.
2.  **Memoria Estructurada:** A diferencia de los chatbos convencionales, este motor mantiene un estado explícito (`ScriptMemory`) que evoluciona con cada bloque generado, evitando repeticiones y contradicciones.
3.  **Blueprints (Planos):** Se reconoce que un video "Top 10" tiene una estructura matemática y narrativa radicalmente distinta a un "Video Tutorial" o una "Historia". El motor adapta su estrategia de tiempos y estructura según el `Blueprint` seleccionado.
4.  **Validación Determinista (QA):** La IA es creativa pero desordenada. Capas de código rígido (TypeScript) validan y limpian la salida de la IA (ej. eliminando texto de imágenes) antes de que llegue al usuario.

---

## 2. Arquitectura del Sistema

El backend está organizado modularmente para facilitar la escalabilidad y el mantenimiento.

### Estructura de Directorios (`backend/src/services/ai/`)

| Directorio/Archivo | Descripción |
| :--- | :--- |
| **`aiService.ts`** | **El Cerebro.** Contiene el bucle principal (`generateFullProject`). Gestiona el estado, llama a los sub-servicios y maneja el logging. |
| **`blueprints/`** | **Estrategias.** Contiene la lógica específica de cada formato. |
| `blueprints/index.ts` | Exporta `NarrativeBlueprint`, `TopBlueprint`, etc. Define cómo se calcula el *pacing* (ritmo). |
| **`prompts/`** | **Ingeniería de Prompts.** Funciones puras que devuelven strings optimizados para Gemini. |
| `outlinePrompt.ts` | Genera la estructura maestra basada en el presupuesto. |
| `scriptPrompt.ts` | Genera texto narrativo recibiendo `ScriptMemory`. |
| `sceneMapPrompt.ts` | Convierte texto en segmentos de tiempo (`SEG_ID`). |
| `styleBiblePrompt.ts` | Define la dirección de arte global. |
| `promptCardsPrompt.ts` | Genera instrucciones para Stable Diffusion. |
| **`validators/`** | **Control de Calidad.** |
| `promptQA.ts` | Revisa los prompts de imagen en busca de errores comunes (texto, longitud). |

---

## 3. Pipeline de Ejecución (Paso a Paso)

El flujo de datos es estrictamente secuencial. Si un paso falla, el proceso se detiene para evitar errores en cascada.

### Paso 1: Configuración y Presupuesto (Budgeting)
Antes de llamar a cualquier IA, calculamos los límites físicos del proyecto.

*   **Input:** `targetDuration` (600s), `blueprint` (Top 10).
*   **Proceso:**
    1.  Se carga el `TopBlueprint`.
    2.  Se ejecuta `pacingStrategy(600, { topCount: 10 })`.
    3.  Se calcula:
        *   `Hook`: 30s
        *   `Intro`: 30s
        *   `Items (x10)`: 48s cada uno (Restante / 10)
        *   `Outro`: 30s
*   **Output (`Budget`):**
    ```json
    {
      "wpm": 150,
      "targetWords": 1500,
      "hookSec": 30,
      "bodySec": 510,
      "closeSec": 30,
      "secPerItem": 48
    }
    ```

### Paso 2: Generación del Outline (Estructura)
La IA actúa como arquitecto. No escribe el guion, solo define *qué* debe pasar.

*   **Prompt:** Recibe el `Budget` y reglas del Blueprint (ej. "Debes listar del 10 al 1").
*   **Output (`Outline`):**
    ```json
    {
      "sections": [
        { "id": "S1", "title": "Hook", "goal": "Impactar", "timeBudgetSec": 30 },
        { "id": "S2", "title": "Item 10", "goal": "Presentar opción barata", "timeBudgetSec": 48 },
        ...
      ]
    }
    ```

### Paso 3: Escritura de Guion (Iterativo con Memoria)
Aquí ocurre la magia de la coherencia.

*   **Inicialización:** `ScriptMemory` comienza vacío.
*   **Bucle:** Por cada sección del Outline:
    1.  Se inyecta el `Running Summary` actual en el prompt.
    2.  La IA escribe el texto de la sección.
    3.  El texto generado se resume y se añade al `Running Summary`.
    4.  Se actualiza la lista de `Banned Repetitions`.
*   **Resultado:** El bloque 5 "sabe" lo que se dijo en el bloque 1, permitiendo referencias cruzadas ("Como vimos al principio...").

### Paso 4: Mapa de Escenas (Scene Mapping)
Transformación de Texto a Tiempo.

*   **Objetivo:** Dividir bloques de texto largos en segmentos visuales digeribles (5-10s).
*   **IDs Estables:** Se generan IDs como `SEG_001`, `SEG_002`. Esto es crucial para que el usuario pueda luego regenerar *solo una escena* sin romper todo el video.
*   **Continuidad:** Se etiquetan los segmentos (`visualRole: establishing`, `beatType: transition`).

### Paso 5: Biblia de Estilo (Style Bible)
Definición de la estética global.

*   **Prompt:** Analiza el `visualStyle` (ej. "Cyberpunk").
*   **Genera:**
    *   `Palette`: ["Neon Pink", "Cyber Blue", "Deep Black"]
    *   `Lighting`: "Volumetric fog, neon signs"
    *   `Global Locks`: ["Futuristic City", "Night"] (Estos keywords se forzarán en *todos* los prompts).

### Paso 6: Generación de Prompt Cards
Creación de las instrucciones para la IA de imagen.

*   **Fusión:** Para cada `SEG_ID`:
    *   Toma la descripción visual de la escena.
    *   Le aplica el estilo de la `StyleBible`.
    *   Añade los `Global Locks`.
    *   Añade `Negative Prompts` (ej. "blurry, distortion").
*   **Regla Anti-Texto:** Si `noTextInImages` es true, se inyecta agresivamente "text, watermark, typography" en el negative prompt.

### Paso 6.5: Prompt QA (Validación)
El "Portero".

*   **Lógica:** Revisa cada `PromptCard` generada.
*   **Reglas:**
    1.  ¿Contiene palabras prohibidas ("text", "caption")? -> **Warning**.
    2.  ¿Faltan los Global Locks obligatorios? -> **Warning**.
    3.  ¿Es demasiado corto (<15 caracteres)? -> **Warning**.
*   **Acción:** Marca el estado (`passed` / `warning`) para que el frontend pueda alertar al usuario o filtrar.

---

## 4. Modelos de Datos (Deep Dive)

### `ProjectPackage` (El objeto final)
Es lo que recibe el frontend. Contiene **todo** lo necesario para renderizar el editor.

```typescript
interface ProjectPackage {
  projectId: string;
  runId: string;      // ID único de trazabilidad (para logs)
  blueprint: string;  // Estrategia usada
  budgets: Budget;    // Cálculos iniciales
  outline: Outline;   // Estructura
  scriptBlocks: ScriptBlock[]; // Texto narrativo
  sceneMap: SceneSegment[];    // Timeline visual
  styleBible: StyleBible;      // Guía estética
  promptCards: PromptCard[];   // Prompts de imagen (post-QA)
  validation: { status: 'ok'|'warn', issues: [] };
}
```

### `ScriptMemory` (Estado interno)
```typescript
interface ScriptMemory {
  thesis: string;          // El "Norte" del video
  runningSummary: string;  // Resumen de lo escrito hasta ahora
  facts: string[];         // Datos duros que no pueden cambiar
  bannedRepetitions: string[]; // Conceptos ya explicados
}
```

---

## 5. Extensibilidad

### Cómo añadir un nuevo Blueprint (Ej. "Tutorial de Cocina")

1.  Crear `backend/src/services/ai/blueprints/cooking.ts` (o añadir a `index.ts`).
2.  Definir la estrategia:
    ```typescript
    const CookingBlueprint: Blueprint = {
      type: 'tutorial',
      description: 'Receta paso a paso',
      structureStrategy: 'Intro -> Ingredientes -> Pasos (1..N) -> Emplatado -> Cata',
      pacingStrategy: (duration) => ({
        hookSec: 15,
        bodySec: duration - 45, // Mucho tiempo en pasos
        closeSec: 30
      })
    };
    ```
3.  Registrarlo en el objeto `Blueprints`.
4.  ¡Listo! El motor ahora sabe cómo distribuir el tiempo y estructurar recetas.

---

## 6. Sistema de Logs y Auditoría

Cada ejecución crea una carpeta única en `backend/logs/run_<TIMESTAMP>/`.

**Contenido de la carpeta:**
*   `00_brief.json`: Snapshot exacto de lo que pidió el usuario.
*   `01_budget.json`: Resultado de la matemática de tiempos.
*   `02_outline.json`: La estructura que propuso la IA.
*   `03_script_block_X_Y.json`: **Crucial.** Muestra el prompt exacto enviado para ese bloque y el estado de la memoria en ese momento. Permite depurar "por qué la IA dijo esto".
*   `07_final_package.json`: El resultado final.

---

## 7. Configuración

*   **Modelo IA:** `gemini-2.0-flash-exp` (Configurado en `backend/src/config/gemini.ts`). Seleccionado por su ventana de contexto y velocidad.
*   **WPM Base:** 150 (Configurable en `aiService.ts`).
*   **API Keys:** Requiere `GEMINI_API_KEY` en `.env`.