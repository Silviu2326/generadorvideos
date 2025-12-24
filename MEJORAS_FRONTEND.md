# Documento Maestro de Arquitectura: Frontend de Edición de Video (NLE)

Este documento sirve como la referencia definitiva para la ingeniería, arquitectura y diseño de producto del sistema de edición de video en el navegador ("Video Generator"). Su objetivo es transformar un prototipo funcional en una estación de trabajo de grado profesional, escalable y robusta.

---

## 1. Filosofía Arquitectónica y Modelo Mental

### 1.1. El Editor como Sistema Operativo
No debemos tratar el editor como una simple "página web con formularios". Debe concebirse como un sistema operativo ligero dentro del navegador que gestiona:
*   **Recursos:** Memoria, decodificadores de video, hilos de CPU (Workers).
*   **Procesos:** Reproducción, renderizado, exportación, autoguardado.
*   **Sistema de Archivos:** Caché local, gestión de Blobs, sistema de archivos virtual (OPFS).

### 1.2. Edición No Destructiva (Non-Destructive Editing)
El principio core es que **nunca modificamos los archivos originales**.
*   **Separación Fuente vs. Instancia:** Un archivo de video subido es un "Source". Cuando se arrastra a la línea de tiempo, se crea una "Clip Instance".
*   **Metadatos como Verdad:** El proyecto es solo un archivo JSON ligero (EDL - Edit Decision List) que apunta a los archivos originales con instrucciones de transformación (punto de entrada, duración, filtros). El renderizado final es la única vez que se "queman" los píxeles.

---

## 2. Ingeniería del Motor de Video (The Core Engine)

### 2.1. Arquitectura de Sincronización (The Master Clock)
El mayor desafío en la web es la sincronización AV (Audio/Video).
*   **Desacople del DOM:** El tiempo no puede depender de actualizaciones del DOM ni de `setTimeout`.
*   **Reloj de Audio:** El contexto de Audio (`AudioContext.currentTime`) es el reloj más preciso del navegador. El video y la UI deben esclavizarse a este reloj para evitar "drift" (desfase) en sesiones largas.
*   **Pipeline de Renderizado:**
    1.  **Tick:** El reloj avanza.
    2.  **Query:** Se consulta el estado del proyecto para el tiempo `t`.
    3.  **Resolve:** Se calcula qué clips están visibles y qué efectos aplican.
    4.  **Draw:** Se dibujan los frames en un `<canvas>` WebGL o se actualizan elementos DOM.

### 2.2. Gestión de Recursos y Memoria (Garbage Collection)
El video 4K consume GBs de RAM rápidamente.
*   **Pool de Recursos:** Implementar un sistema LRU (Least Recently Used) para liberar texturas de video o buffers de audio que no se han usado en los últimos minutos.
*   **Gestión de Blob URLs:** Cada `URL.createObjectURL` debe ser rastreado y revocado explícitamente (`URL.revokeObjectURL`) cuando el asset se elimina del proyecto para evitar fugas de memoria del navegador.

### 2.3. Proxy Workflow
El navegador no puede decodificar múltiples streams de video H.264/HEVC de alto bitrate simultáneamente sin stuttering.
*   **Transcodificación en Cliente:** Usar WebAssembly (FFmpeg.wasm) para generar versiones de baja resolución ("Proxies") localmente al importar.
*   **Switching Transparente:** El motor debe usar los proxies durante la edición y cambiar silenciosamente a los originales ("High Res") al pausar o al exportar.

---

## 3. Experiencia de Línea de Tiempo (The Timeline UX)

### 3.1. Matemáticas de la Interacción
*   **Sistema de Coordenadas Híbrido:** La línea de tiempo debe traducir constantemente entre `Tiempo (segundos)` y `Espacio (píxeles)`.
    *   `pixel = tiempo * zoomLevel`
    *   `tiempo = pixel / zoomLevel`
*   **Cuantización (Snapping Inteligente):**
    *   Implementar un "campo magnético" alrededor de cortes y cabezal de reproducción.
    *   El snapping debe ser contextual: fuerte al arrastrar rápido, suave o desactivado al pulsar una tecla modificadora (ej. Cmd/Ctrl).

### 3.2. Herramientas de Edición Avanzadas
Más allá de mover clips, se requieren herramientas modales:
*   **Ripple Edit:** Al borrar un clip, cerrar el hueco automáticamente moviendo todo el contenido posterior.
*   **Rolling Edit:** Mover el punto de corte entre dos clips adyacentes sin cambiar la duración total de la secuencia.
*   **Slip Tool:** Cambiar el contenido (in/out points) del clip sin cambiar su posición ni duración en la línea de tiempo.
*   **Razor/Cut:** Dividir una instancia de clip en dos instancias independientes manteniendo continuidad.

### 3.3. Virtualización Bidireccional
*   **Horizontal:** Solo renderizar clips en la ventana de tiempo visible.
*   **Vertical:** Si hay 50 pistas de audio, solo renderizar las visibles en el viewport y agrupar/colapsar el resto.

---

## 4. Arquitectura de Datos y Estado

### 4.1. Estructura de Datos Normalizada
Evitar estructuras anidadas profundas. Usar el patrón de "Base de Datos en Frontend".
*   **Entidades Planas:** `clips`, `tracks`, `assets` deben ser objetos indexados por ID, no arrays.
*   **Relaciones por ID:** Las pistas almacenan arrays de IDs de clips (`['clip-1', 'clip-2']`), no los objetos clip enteros. Esto facilita mover clips entre pistas sin duplicación de datos.

### 4.2. Máquina de Estados Finita (FSM)
El editor tiene modos claramente definidos que cambian el comportamiento de los inputs (mouse/teclado).
*   **Estados:** `IDLE`, `PLAYING`, `DRAGGING_CLIP`, `RESIZING_CLIP`, `SELECTING_REGION`, `SCRUBBING`.
*   Usar una máquina de estados (XState o reducers complejos) previene bugs como "iniciar una selección mientras se arrastra un clip".

### 4.3. Historial Ramificado (Undo/Redo)
*   **Inmutabilidad:** Usar librerías como Immer para producir parches de cambios.
*   **Batching:** Agrupar acciones granulares (ej. arrastrar un slider de volumen genera 100 eventos) en una sola transacción de historial al soltar el mouse.

---

## 5. Capa de Efectos y Composición

### 5.1. Grafo de Renderizado (Render Graph)
En lugar de una lista fija de efectos, pensar en un grafo de nodos.
*   **Nodos:** Source (Video) -> Transform (Scale/Pos) -> Filter (Color) -> Mix (Opacity) -> Output.
*   Esto permite flexibilidad futura para ruteo complejo de audio o máscaras de video.

### 5.2. Aceleración por Hardware
*   Los efectos visuales (filtros de color, blur, chroma key) deben ejecutarse en la GPU mediante WebGL/WebGPU shaders. Ejecutarlos en CPU (Canvas 2D API) será demasiado lento para video HD.

---

## 6. Colaboración y Sincronización Backend

### 6.1. Conflict-free Replicated Data Types (CRDTs)
Para permitir que dos usuarios editen el mismo proyecto sin sobrescribirse (estilo Google Docs/Figma).
*   **Yjs / Automerge:** Utilizar estas librerías para sincronizar el estado del JSON del proyecto. Permite resolución automática de conflictos si dos usuarios mueven el mismo clip.

### 6.2. Optimistic UI Updates
*   La interfaz debe reaccionar instantáneamente (0ms latencia). La sincronización con el servidor ocurre en segundo plano. Si falla, se muestra un indicador de error y se ofrece reintentar, pero no se bloquea al usuario.

---

## 7. Accesibilidad (a11y) en un entorno Canvas/Visual

Hacer accesible un editor de video es un reto enorme pero necesario.
*   **DOM en la Sombra:** Mantener una estructura HTML semántica invisible que refleje el estado del Canvas. Los lectores de pantalla leerán este DOM.
*   **Navegación por Teclado:** Todo debe ser operable sin ratón.
    *   `J/K/L`: Retroceder, Pausa/Play, Avanzar (estándar de la industria).
    *   `I/O`: Marcar entrada/salida.
    *   Flechas: Navegar entre cortes.
*   **Anuncios de Estado:** Usar regiones `aria-live` para anunciar cambios como "Clip movido al segundo 15".

---

## 8. Estrategia de Testing y Calidad

### 8.1. Visual Regression Testing
Los tests unitarios no capturan si un video se ve mal.
*   Implementar tests (ej. con Playwright/Cypress) que tomen capturas de pantalla del canvas en tiempos específicos y las comparen con imágenes de referencia ("Golden Masters").

### 8.2. Fuzz Testing
*   Bombardear el motor con inputs aleatorios (clics rápidos, atajos de teclado random, archivos corruptos) para asegurar que el editor nunca crashee ("The Monkey Test").
