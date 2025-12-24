# Plan de Transición: Creator Studio AI

Este documento detalla la evolución del proyecto desde su estado actual (prototipo) hasta el estado objetivo tras la ejecución de los 40 prompts de ingeniería.

---

## 1. Estado Actual vs. Estado Futuro

| Característica | Estado Actual (Prototipo) | Estado Futuro (Plataforma NLE) |
| :--- | :--- | :--- |
| **Editor de Video** | Monolito (`ProjectEditor.tsx`, 500+ líneas). | Arquitectura Modular (Atomic Design) en `src/features/editor`. |
| **Reproducción** | `setInterval` simple, imágenes estáticas. | Motor basado en `requestAnimationFrame`, `<video>` nativo sincronizado. |
| **Estado** | `useState` local disperso. | Store Global con **Zustand** (Tracks, Clips, Playhead). |
| **Interacción** | Básica o inexistente. | **Drag & Drop** profesional con `dnd-kit`, selección múltiple. |
| **Backend API** | CRUD básico, repetición de código. | Validaciones estrictas (**Zod**), Middleware de errores, Logs (**Winston**). |
| **Procesamiento** | Síncrono (bloquea el servidor). | Asíncrono con Colas (**BullMQ** + Redis) para transcodificación. |
| **Tiempo Real** | No existe. | Infraestructura de **WebSockets** (Socket.io) lista para colaboración. |
| **Seguridad** | Básica. | **Helmet**, Rate Limiting, URLs firmadas para uploads directos. |

---

## 2. Nueva Arquitectura de Archivos

Tras la ejecución, el proyecto tendrá esta nueva estructura clave:

### Frontend (`src/features/editor/`)
*   `store/editorStore.ts`: El cerebro de la aplicación (Zustand).
*   `hooks/usePlayback.ts`: El corazón del motor de tiempo.
*   `components/Timeline/`:
    *   `TimelineContainer.tsx`: Orquestador de pistas.
    *   `TrackHeader.tsx`: Controles de pista.
    *   `Clip.tsx`: Componente memoizado de alto rendimiento.
*   `components/Preview/VideoPlayer.tsx`: Renderizador visual.

### Backend (`backend/src/`)
*   `queues/mediaQueue.ts`: Cola de trabajos de BullMQ.
*   `workers/mediaWorker.ts`: Procesador de video en segundo plano.
*   `schemas/projectSchemas.ts`: Validaciones Zod.
*   `websockets/socketHandler.ts`: Lógica de tiempo real.

---

## 3. Checklist de Revisión (QA)

Una vez finalizado el script `runner_gemini.js`, verifica los siguientes puntos para asegurar el éxito de la refactorización:

### 3.1. Frontend (Verificación Visual)
- [ ] **Compilación:** Ejecuta `npm run dev` y verifica que no haya errores de TypeScript ni pantallas blancas.
- [ ] **Renderizado:** Navega a `/editor`. ¿Se ve la línea de tiempo con las pistas y el reproductor?
- [ ] **Reproducción:** Pulsa `Espacio` o el botón Play. ¿Avanza el cursor de tiempo fluidamente?
- [ ] **Drag & Drop:** Intenta arrastrar un clip simulado. ¿Se mueve? (Nota: Puede requerir ajustes finos de CSS).
- [ ] **Store:** Instala "Redux DevTools" (compatible con Zustand) y verifica si las acciones (`togglePlay`, `selectClip`) disparan cambios de estado.

### 3.2. Backend (Verificación Funcional)
- [ ] **Inicio:** Ejecuta `npm start` en `backend/`. Verifica que **Winston** muestre logs JSON limpios y que no crashee por falta de Redis (debería mostrar warnings si no está conectado, pero no caerse).
- [ ] **Validación:** Intenta crear un proyecto con datos inválidos usando Postman. ¿Recibes un error 400 detallado por Zod?
- [ ] **Colas:** Revisa si el log muestra "Procesando trabajo..." al simular una subida (endpoint `/upload-intent` o script de test).
- [ ] **Seguridad:** Verifica en las cabeceras de respuesta que `Helmet` esté inyectando headers como `X-Content-Type-Options`.

### 3.3. Archivos Críticos a Revisar Manualmente
Aunque la IA genera el código, revisa estos archivos por si acaso:
1.  `src/features/editor/store/editorStore.ts`: Asegura que la lógica de persistencia no rompa la hidratación inicial.
2.  `backend/src/index.ts`: Verifica que el orden de los middlewares sea correcto (Helmet -> CORS -> JSON -> Rutas -> ErrorHandler).
3.  `backend/src/workers/mediaWorker.ts`: Confirma que la conexión a Redis tenga manejo de errores (bloques try-catch).

---

## 4. Próximos Pasos (Post-Transición)

Una vez validada esta base:
1.  Conectar el `VideoPlayer` con archivos reales (actualmente usa mocks).
2.  Implementar la UI real de `dnd-kit` (estilos CSS para el dragging).
3.  Levantar una instancia real de Redis para activar las colas en producción.
