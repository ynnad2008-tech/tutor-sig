# Tutor-SIG — Copiloto Docente de IA para SIG y Teledetección

Asistente pedagógico especializado en **Sistemas de Información Geográfica, Teledetección, Cartografía e IA Geoespacial** para la **Universidad Mariana** (Pasto, Colombia). Autor intelectual: **Geógr. Dany Benavides Bolaños**.

https://tutor-sig.onrender.com



La aplicación es **independiente del proveedor de IA**: funciona con OpenRouter, DeepSeek, Gemini, Claude o Ollama, seleccionables mediante variables de entorno sin modificar ningún componente de la interfaz.

> Proyecto generado en AI Studio: https://ai.studio/apps/26aa80cb-0475-4a5c-ac8b-969250ceec31

## Arquitectura

```
┌──────────── Frontend (React 19 + Tailwind) ────────────┐
│ ChatTutor · DeliverableEvaluator · TeacherTools · ...  │
│                     │ (único acceso)                    │
│        src/services/aiService.ts  (fetch /api/*)       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP mismo origen (contratos estables)
┌──────────────────────▼──────────────────────────────────┐
│ server.ts (Express)                                     │
│   /api/chat · /api/evaluate · /api/teacher-tool         │
│   /api/geoprocess-flow · /api/health                    │
│   server/prompts.ts      (identidad + plantillas)       │
│   server/ai/generator.ts (fallback de modelos por env)  │
│   server/ai/providers.ts (OpenRouter · DeepSeek ·       │
│                           Gemini · Claude · Ollama)     │
└──────────────────────┬──────────────────────────────────┘
             .env  →  MODEL_PROVIDER · DEFAULT_MODEL ·
                      FALLBACK_MODELS · API keys (solo servidor)
```

- **Las claves de API viven únicamente en el servidor.** El navegador jamás llama a OpenRouter ni a ningún proveedor directamente.
- **Cambiar de modelo no requiere tocar el frontend**: el pool de modelos se define solo con variables de entorno.
- **Fallback automático**: si un modelo responde 429, 503 o timeout, el evento se registra en los logs y se intenta el siguiente modelo de la cadena.

## Requisitos

- Node.js 18+ (o Bun)
- Una clave de API de **OpenRouter** (https://openrouter.ai/settings/keys)

## Configuración

Copia `.env.example` a `.env` (o `.env.local`, que tiene prioridad) y define:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `MODEL_PROVIDER` | Proveedor activo: `openrouter` \| `deepseek` \| `gemini` \| `claude` \| `ollama` | `openrouter` |
| `OPENROUTER_API_KEY` | Clave de OpenRouter (proveedor prioritario) | — |
| `DEFAULT_MODEL` | Modelo principal | `deepseek/deepseek-v4-flash` |
| `FALLBACK_MODELS` | Cadena de fallback separada por comas, en orden | `qwen/qwen3.6-flash,anthropic/claude-sonnet-4.6,minimax/minimax-m3:free` |
| `DEEPSEEK_API_KEY` | Clave para proveedor DeepSeek directo (opcional) | — |
| `GEMINI_API_KEY` | Clave de Gemini (AI Studio la inyecta como secreto) | — |
| `ANTHROPIC_API_KEY` | Clave de Anthropic/Claude (preparado) | — |
| `OLLAMA_BASE_URL` | URL de Ollama local (preparado) | `http://localhost:11434` |
| `AI_REQUEST_TIMEOUT_MS` | Timeout por petición a un modelo | `120000` |
| `AI_FALLBACK_CYCLES` | Ciclos completos sobre el pool | `2` |
| `TUTOR_SIG_NAME` / `TUTOR_SIG_INSTITUTION` / `TUTOR_SIG_AUTHOR` | Identidad institucional (preparación multi-institución, p. ej. CESMAG) | Tutor-SIG / Universidad Mariana / Geógr. Dany Benavides Bolaños |

**Orden de modelos por defecto** (OpenRouter):

1. `deepseek/deepseek-v4-flash`
2. `qwen/qwen3.6-flash`
3. `anthropic/claude-sonnet-4.6`
4. `minimax/minimax-m3:free` (solo si los pagos fallan, p. ej. cuenta sin créditos)

> Nota: los modelos `deepseek/*` son de texto plano. Si una consulta incluye imágenes, se registra el evento y se omite ese modelo — la imagen llega al primer modelo multimodal de la cadena (p. ej. `qwen/qwen3.6-flash`).

## Ejecución local

**Con lanzador (Windows)**: doble clic en `Iniciar-Tutor-SIG.bat` (invoca `Tutor-SIG.ps1`): verifica Node, crea `.env` la primera vez, instala dependencias si faltan, abre el navegador y arranca el servidor en http://localhost:3000.

**Manual**:

```bash
npm install        # o bun install
# 1. Configura OPENROUTER_API_KEY en .env
npm run dev        # servidor Express + Vite en http://localhost:3000
```

## Compilación y producción

```bash
npm run lint          # verificación de tipos (tsc --noEmit)
npm run build         # vite build + bundle del servidor (dist/server.cjs)
npm start             # node dist/server.cjs (sirve estáticos + API)
npm run test:fallback # prueba E2E del fallback con un mock de OpenRouter (sin claves reales)
```

## Despliegue en línea (enlace siempre activo)

### Opción A — Render (gratis, sin tarjeta)

El repo incluye un blueprint (`render.yaml`) listo para desplegar:

1. Crea tu cuenta en https://render.com (puedes entrar con GitHub).
2. Dashboard → **New +** → **Blueprint** → conecta `ynnad2008-tech/tutor-sig`.
3. Render detecta `render.yaml` y crea el servicio web con la config ya lista.
4. En el panel del servicio: **Environment** → añade el secreto `OPENROUTER_API_KEY` con tu clave.
5. Render compila (`npm run build`), despliega y te da el enlace público:
   **https://tutor-sig.onrender.com** (el nombre depende de disponibilidad).

> Nota: en el plan gratuito el servicio "duerme" tras ~15 min sin uso; el primer
> acceso tarda ~1 min en despertar. Con un plan de pago queda siempre encendido.

### Opción B — AI Studio (si prefieres Google, ya tienes el proyecto)

1. Abre tu proyecto: https://ai.studio/apps/26aa80cb-0475-4a5c-ac8b-969250ceec31
2. En el panel **Secrets** añade: `OPENROUTER_API_KEY`, `MODEL_PROVIDER=openrouter`,
   `DEFAULT_MODEL=deepseek/deepseek-v4-flash` y `FALLBACK_MODELS=qwen/qwen3.6-flash,anthropic/claude-sonnet-4.6,minimax/minimax-m3:free`.
3. Pulsa **Deploy** y comparte el enlace público generado.

La API key nunca se sube al repositorio: solo vive en el panel de secretos de la plataforma.

## Materiales publicados

| Material | Enlace |
|---|---|
| Material de estudio — Fase 3: Análisis Espacial (.docx) | `/materials/Fase3_Analisis_Espacial.docx` |

El archivo vive en `public/materials/` y se sirve en la raíz del sitio (también accesible desde los botones del chat).

## API

| Endpoint | Entrada | Salida |
|---|---|---|
| `POST /api/chat` | `{ messages[], software?, contextUnit?, discipline? }` | `{ text }` |
| `POST /api/evaluate` | `{ title?, description?, imageBase64?, imageMime?, software?, scale?, datum? }` | `{ evaluation }` |
| `POST /api/teacher-tool` | `{ toolType, topic, unit?, software?, studyArea?, targetAudience? }` | `{ result }` |
| `POST /api/geoprocess-flow` | `{ problemDescription, software? }` | `{ flow }` |
| `GET /api/health` | — | `{ status, tutor, author }` |

## Estado de los módulos académicos

Los siguientes componentes están implementados pero **aún no conectados** a la navegación principal (`src/App.tsx` solo renderiza el chat): `DeliverableEvaluator`, `GeodeticSystemChecker`, `GeoprocessFlowBuilder`, `SpectralIndicesCalculator` y `TeacherTools`. Sus endpoints asociados (`/api/evaluate`, `/api/teacher-tool`, `/api/geoprocess-flow`) siguen operativos y con sus contratos intactos, listos para activarse desde una futura navegación por módulos (p. ej. Tutor-SIG CESMAG).
