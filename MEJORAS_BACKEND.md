# Documento Maestro de Arquitectura: Backend (Media Platform Engine)

Este documento define la arquitectura técnica para el backend de "Creator Studio AI". El objetivo es transicionar de una API REST básica a una **plataforma distribuida de procesamiento de video**, diseñada para soportar cargas pesadas, colaboración en tiempo real y flujos de trabajo de medios complejos.

---

## 1. Filosofía Arquitectónica

### 1.1. Arquitectura Orientada a Eventos (Event-Driven)
El procesamiento de video es lento. Una petición HTTP nunca debe esperar a que termine un render.
*   **Patrón Fire-and-Forget:** La API recibe la solicitud, encola un trabajo (`Job`) y responde inmediatamente con un `202 Accepted` y un `jobId`.
*   **Desacople:** El servidor API (Express) es ligero y rápido. Los "Workers" (procesos en segundo plano) son pesados y escalan independientemente.

### 1.2. The Backend as a Coordinator
El backend no debe tocar los bytes del video si puede evitarlo. Su rol es **orquestar** el flujo de datos entre el cliente (Frontend), el almacenamiento (Bucket) y los servicios de IA/Transcodificación.

---

## 2. Pipeline de Medios (The Media Engine)

El frontend requiere "Proxies" y "Waveforms". El backend debe generarlos.

### 2.1. Ingesta de Archivos "Direct-to-Cloud"
Subir un video de 4GB a través de Node.js bloqueará el event loop y consumirá memoria RAM excesiva.
*   **Estrategia:** Implementar **Signed URLs (S3/Supabase Storage)**.
    1.  Cliente pide permiso para subir: `POST /api/media/upload-intent`.
    2.  Backend valida cuotas y devuelve una URL firmada temporal (`PUT` url).
    3.  Cliente sube el binario directamente al Storage.
    4.  Webhook del Storage notifica al Backend que el archivo está listo.

### 2.2. Sistema de Colas (Job Queues)
Para procesar los medios subidos, necesitamos una cola robusta.
*   **Tecnología:** **BullMQ** (basado en Redis) es el estándar de oro en Node.js.
*   **Flujo del Worker:**
    1.  Evento: `file_uploaded`.
    2.  Worker descarga el archivo temporalmente.
    3.  **FFmpeg:** Genera proxy (720p, bajo bitrate) -> Sube a Storage.
    4.  **FFmpeg:** Extrae forma de onda (JSON/PNG) -> Sube a Storage.
    5.  Worker actualiza el estado del asset en la DB a `READY` y guarda las URLs del proxy y waveform.

### 2.3. Gestión de Almacenamiento
*   **Ciclo de Vida:** Configurar reglas de ciclo de vida (Lifecycle Rules) en el bucket para eliminar archivos temporales o mover originales a "Cold Storage" (Glacier) después de X días de inactividad para ahorrar costos.

---

## 3. Infraestructura de Tiempo Real (Real-Time Collaboration)

El frontend utilizará **CRDTs (Yjs)** para edición colaborativa. El backend necesita un mecanismo de señalización y persistencia.

### 3.1. Servidor de WebSockets
*   **Tecnología:** **Socket.io** o **uWebSockets.js** (para ultra-rendimiento).
*   **Función:** Actuar como repetidor (Relay) de los cambios delta de los documentos Yjs entre clientes conectados al mismo `projectId`.

### 3.2. Persistencia del Estado (Throttled Persistence)
No podemos escribir en la base de datos SQL cada vez que un usuario mueve el mouse.
*   **Estrategia:**
    1.  Mantener el estado "caliente" del documento en memoria (o Redis).
    2.  Hacer **Debounce** de la escritura a Postgres/Supabase: Guardar el snapshot del proyecto en la DB solo cada 10 segundos o cuando la sesión termina.

---

## 4. API Design & Seguridad de Datos

### 4.1. Validación Estricta de Esquemas (Zod)
El `Project JSON` (EDL) es la estructura más crítica. Si se corrompe, el proyecto no abre.
*   **Schema Enforcement:** Definir esquemas Zod rigurosos que coincidan exactamente con los tipos del frontend.
    *   Validar que `clip.start + clip.duration` no exceda límites lógicos.
    *   Validar integridad referencial: Que los `assetId` dentro de los clips existan en la tabla de Assets.

### 4.2. Control de Acceso (RBAC)
*   **Middleware de Propiedad:** Asegurar que solo el dueño del proyecto o colaboradores explícitos puedan leer/escribir.
*   **Resource Quotas:** Middleware para verificar límites del plan (ej. "Free Tier: Max 1GB storage").

---

## 5. Observabilidad y Mantenimiento

### 5.1. Logging Estructurado y Distribuido
`console.log` no sirve cuando tienes workers asíncronos.
*   **Herramienta:** **Pino** o **Winston**.
*   **Contexto:** Cada log debe incluir `requestId` (para trazar una petición HTTP) y `jobId` (para trazar el proceso en background).
*   Ejemplo: `logger.info("Transcoding started", { jobId: 123, assetId: "xyz", size: "400MB" })`.

### 5.2. Health Checks
Implementar endpoints `/health` y `/ready` que verifiquen no solo que Express corre, sino que:
*   La conexión a Redis (Colas) está activa.
*   La conexión a la DB (Supabase) responde.
*   El espacio en disco temporal es suficiente.

---

## 6. Integración de IA (Backend-for-Frontend)

El backend orquesta las llamadas a servicios de IA (Gemini, OpenAI, ElevenLabs).

### 6.1. Streaming Responses
Para generación de texto o guiones, no esperar a la respuesta completa.
*   Usar **Server-Sent Events (SSE)** o Streams HTTP para enviar tokens al frontend a medida que la IA los genera, mejorando la latencia percibida.

### 6.2. Caching de IA
Las llamadas a IA son caras ($).
*   Implementar una capa de caché (Redis) para prompts idénticos. Si un usuario pide "Genera ideas para YouTube sobre gatos" dos veces, la segunda vez se sirve de caché.

---

## 7. Roadmap de Implementación Backend

1.  **Fase 1: Fundación Sólida**
    *   Configurar **Winston** (Logging) y **Helmet** (Seguridad).
    *   Implementar Middleware de Errores Global.
    *   Migrar validaciones manuales a **Zod**.

2.  **Fase 2: Motor de Medios**
    *   Configurar **BullMQ** y **Redis**.
    *   Crear Worker de FFmpeg (puede ser local inicialmente).
    *   Implementar endpoint de "Presigned URLs".

3.  **Fase 3: Tiempo Real**
    *   Levantar servidor WebSocket básico.
    *   Integrar adaptadores para Yjs.

4.  **Fase 4: Optimización**
    *   Rate Limiting por IP/Usuario.
    *   Tests de carga con **k6** para simular subidas masivas.