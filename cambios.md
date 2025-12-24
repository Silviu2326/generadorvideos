1) Cambios en los datos que guardas (ScriptMemory / Blueprint)
A) Añade un VoiceProfile por blueprint

Ahora tu sistema sabe estructura, pero no sabe cómo sonar. Mete esto en cada blueprint (o en el brief):

tone (cómico / emotivo / documental / infantil)

audience (niños / general / adulto)

styleRules[] (5–10 reglas cortas)

bannedPhrases[] (frases prohibidas)

bannedCliches[] (clichés prohibidos)

ctaPolicy (dónde permites CTA y cómo)

Ejemplo (cómico/cómic):

styleRules: “frases cortas”, “1 gancho fuerte al inicio”, “no narrador de tráiler”, “no meta (‘este video…’)”

bannedPhrases: “Este vídeo captura…”, “Nuestra historia…”, “¿Quién es?”, “El poder de la amistad”, “Cumplió su misión”

B) Entity Lock real (una sola verdad)

Crea un objeto EntitiesLock una vez y úsalo en TODO:

personaje principal (Myke)

vecina (Doña García)

lugar (barrio tal)

objetos clave (bicicleta, cerca blanca…)

Y una regla: “No inventar nombres nuevos”.

2) Cambios en prompts (lo que más impacta)
A) scriptPrompt.ts (escritura de bloques) — cambia “Terminology Locks” por “Banned Phrases”

Ahora estás forzando palabras como “video/historia” o poniendo límites ridículos (6–8 palabras) y eso obliga a sonar a plantilla.

Modifica el prompt para que:

Idioma obligatorio: “Spanish (Spain) 100%”

Prohibido meta: “No digas ‘este vídeo…’, ‘esta historia…’”

Prohibidos clichés (lista)

Variación: “No repitas el nombre Myke en frases consecutivas”

Concreción: “Incluye 1 detalle concreto por bloque” (acción, emoción, mini consecuencia)

Word budget realista: en vez de 6–8 palabras, usa rangos humanos (ej. 18–35 palabras para hooks cortos)

Cambio clave: Deja de forzar “palabras obligatorias” y empieza a prohibir lo genérico.

B) outlinePrompt.ts — añade wordBudget por sección + pacing del blueprint

Tu outline ya tiene timeBudgetSec, pero necesitas que también devuelva wordBudget para que el guion no quede en slogans.

Hook (6s) = ~20–30 palabras

Escena 8s = ~25–40 palabras
(con WPM 150)

3) Añade 2 fases nuevas en tu pipeline (automático de verdad)
Fase 2.5 — “Entities Lock Generator” (1 llamada rápida)

Antes de escribir el guion:

El motor decide nombres y detalles fijos:

“Myke es Jack Russell… collar turquesa…”

“Vecina: Doña García…”

Esto se guarda en ScriptMemory.facts o entities.

Resultado: nunca más “Mrs. Miller / García / Rosa” cambiando.

Fase 3.5 — “Polish Pass” (el salto de calidad)

Después de generar todos los scriptBlocks, haces una pasada para:

quitar repetición

eliminar frases de IA

mejorar ritmo (frases cortas + 1 punchline o mini giro)

mantener el meaning y los tiempos

Importante: el Polish Pass debe devolver los mismos bloques con los mismos IDs, solo reescritos.

Esto es lo que hace que suene humano sin tocar nada a mano.

4) Validadores automáticos (Quality Gates) que disparan reescritura
A) languageValidator

Si el brief es ES:

si detectas demasiado inglés → rechaza y reintenta con prompt “Spanish only”.

B) cliche/metaValidator

Busca en cada bloque:

“este video”, “esta historia”, “cumplió su misión”, “poder de la amistad”, “¿quién es?”
Si aparece:

auto “rewrite block removing banned phrases” (reintento 1)

C) properNameValidator (anti nombres inventados)

Regex simple:

detecta palabras Capitalizadas nuevas (ej. “Miller”, “Rosa”)
Si no están en allowlist (Myke, Doña García):

warning o autorewrite: “replace new proper names with ‘la vecina’”.

D) durationValidator del sceneMap

Asegura: lastEndSec === targetDurationSec
Si sale 90 en un vídeo de 60:

rehacer sceneMap o reescalar.

5) Ajuste de budgets (para evitar guiones “vacíos”)

Ahora mismo tu sistema puede estar generando secciones con presupuestos demasiado agresivos (hooks de 6–8 palabras). Eso crea narración pobre.

Haz esto:

Define mínimos por blueprint:

Hook: mínimo 18–25 palabras

Escena 6–8s: mínimo 18–35 palabras

Si una sección sale por debajo → EXPAND_BLOCK automático

6) Resumen exacto: lo que tienes que modificar en tu repo
Archivos / módulos a tocar

blueprints/*

añadir voiceProfile, bannedPhrases, requiredEntities

prompts/outlinePrompt.ts

incluir wordBudget + reglas de pacing

prompts/scriptPrompt.ts

idioma obligatorio + banned phrases/clichés + “no meta”

aiService.ts

insertar:

Paso 2.5 EntitiesLock

Paso 3.5 PolishPass

Quality Gates con retry

validators/

languageValidator.ts

clicheMetaValidator.ts

properNameValidator.ts

durationValidator.ts (sceneMap)