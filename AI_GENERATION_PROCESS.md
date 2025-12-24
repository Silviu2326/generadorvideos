# Motor de Guion + Generación de Prompts de Imagen (v2)

## 0) Objetivo del módulo

Generar, de forma controlada y regenerable, una estructura completa de vídeo que incluya:

*   **Guion** (dividido en bloques/partes editables)
*   **SceneMap** (segmentos temporales 5–10s o 10s fijo)
*   **PromptCards** (prompts detallados por segmento para generación de imágenes en batch)

Con soporte para diferentes formatos de vídeo (blueprints) (Top, Narrativo, Informativo, Tutorial, etc.) y para regeneración parcial (solo una sección, solo un segmento, etc.).

## 1) Principios de diseño

La v2 se basa en:

*   **Plan Maestro:** (outline con presupuestos) antes de escribir
*   **Guion por bloques:** (unidad regenerable)
*   **SceneMap con constraints:** (5–10s o 10s) para preparar visuales
*   **Style Bible + Continuity Locks:** para prompts coherentes
*   **PromptCards en batch:** (10–20 segmentos por llamada)
*   **Validadores:** (Top: ranks, Narrativo: continuidad, etc.)
*   **Versionado:** (Draft 1, Draft 2…) para no romper lo que ya estaba

## 2) Inputs (Frontend → Backend)

### 2.1 ProjectBrief (lo que manda el wizard)
```json
{
  "title": "string",
  "goal": "string",
  "format": "16:9 | 9:16 | 1:1",
  "targetDurationSec": 600,
  "cadenceSec": 5,
  "blueprint": "top | narrative | informative | tutorial | review | shorts",
  "visualStyle": "cyberpunk | anime | minimal | documentary | ...",
  "languages": ["es", "en"],
  "voice": {
    "es": { "voiceId": "string" },
    "en": { "voiceId": "string" }
  },
  "noTextInImages": true,
  "brandKit": {
    "logoUrl": "string?",
    "colors": ["#..."],
    "fonts": ["..."]
  },
  "blueprintParams": {
    "topCount": 10,
    "topCriteria": "string",
    "pillars": ["..."],
    "characters": [{ "name": "..." }]
  }
}
```

## 3) Output principal (lo que vuelve al frontend)

La salida ya no es solo “escenas”. Es un paquete estructurado:

```json
{
  "projectId": "string",
  "version": "draft-1",
  "blueprint": "informative",
  "budgets": {
    "wpm": 150,
    "targetWords": 1500,
    "minWords": 1350,
    "maxWords": 1575
  },
  "outline": { "...": "..." },
  "scriptBlocks": [ ... ],
  "sceneMap": [ ... ],
  "styleBible": { "...": "..." },
  "promptCards": [ ... ],
  "validation": {
    "status": "ok | warn | fail",
    "issues": []
  },
  "usage": {
    "llmInputTokens": 0,
    "llmOutputTokens": 0
  }
}
```

## 4) Blueprints (formatos) y qué cambia

Los blueprints son reglas y estructuras.

*   **Top (Top 5/10/20):** Ranking completo, no duplicados, orden correcto.
*   **Narrativo:** Continuidad de personajes, causalidad, arco emocional.
*   **Informativo:** Tesis central, pilares cubiertos.

## 5) Algoritmo del motor (end-to-end)

1.  **Paso 1 — Normalización + Presupuesto:** Calcula palabras objetivo basado en duración y WPM.
2.  **Paso 2 — Generar Outline (Plan Maestro):** LLM genera secciones con presupuestos de tiempo y palabras.
3.  **Paso 3 — Guion por bloques:** LLM escribe cada sección basándose en el outline y el contexto anterior.
4.  **Paso 4 — Continuity Pass:** Ajustes globales de cohesión.
5.  **Paso 5 — SceneMap:** Conversión de guion a segmentos temporales (5-10s).
6.  **Paso 6 — Style Bible:** Definición de reglas estéticas globales.
7.  **Paso 7 — PromptCards (batch):** Generación de prompts para imágenes por segmento.
8.  **Paso 8 — Validación por blueprint:** Chequeo final de reglas específicas.

## 6) Regeneración parcial

*   **Regenerar un bloque de guion:** Reescribe scriptBlock -> Recalcula SceneMap parcial -> Regenera PromptCards parciales.
*   **Regenerar un segmento:** Recalcula PromptCard específica -> Regenera imagen.
*   **Cambiar estilo:** Rehace PromptCards (mantiene guion).

## 7) Backend: estructura recomendada

*   `aiController.ts` (HTTP)
*   `aiService.ts` (orquestación pipeline)
*   `promptTemplates/` (archivos individuales para cada paso)
*   `validators/` (lógica de validación)
*   `schemas/` (Zod para validar outputs)

## 7.1 Endpoints (v2)

*   `POST /api/ai/project/generate-full` (Orquestador principal)
*   Endpoints granulares para regeneración (`/outline`, `/script/section`, etc.)

## 8) Robustez

*   Validación de esquemas (Zod).
*   Retries inteligentes.
*   Guardrails de tokens.

## 9) Frontend: Integración en Wizard

*   Barra de progreso por subpasos.
*   Vistas separadas para "Blocks" (Guion) y "Segments" (Visuales).
