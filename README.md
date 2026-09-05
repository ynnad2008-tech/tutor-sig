# Tutor-SIG — Copiloto Docente de IA para SIG y Teledetección

Asistente pedagógico especializado en **Sistemas de Información Geográfica, Teledetección, Cartografía e IA Geoespacial** para la **Universidad Mariana** (Pasto, Colombia). Autor intelectual: **Geógr. Dany Benavides Bolaños**.

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
| `DEFAULT_MODEL` | Modelo principal | `deepseek/deepseek-chat` |
| `FALLBACK_MODELS` | Cadena de fallback separada por comas, en orden | `qwen/qwen3,anthropic/claude` |
| `DEEPSEEK_API_KEY` | Clave para proveedor DeepSeek directo (opcional) | — |
| `GEMINI_API_KEY` | Clave de Gemini (AI Studio la inyecta como secreto) | — |
| `ANTHROPIC_API_KEY` | Clave de Anthropic/Claude (preparado) | — |
| `OLLAMA_BASE_URL` | URL de Ollama local (preparado) | `http://localhost:11434` |
| `AI_REQUEST_TIMEOUT_MS` | Timeout por petición a un modelo | `120000` |
| `AI_FALLBACK_CYCLES` | Ciclos completos sobre el pool | `2` |
| `TUTOR_SIG_NAME` / `TUTOR_SIG_INSTITUTION` / `TUTOR_SIG_AUTHOR` | Identidad institucional (preparación multi-institución, p. ej. CESMAG) | Tutor-SIG / Universidad Mariana / Geógr. Dany Benavides Bolaños |

**Orden de modelos por defecto** (OpenRouter):

1. `deepseek/deepseek-chat`
2. `qwen/qwen3`
3. `anthropic/claude`

> Nota: los modelos `deepseek/*` son de texto plano. Si una consulta incluye imágenes, se registra el evento y se omite ese modelo — la imagen llega al primer modelo multimodal de la cadena (p. ej. `qwen/qwen3`).

## Ejecución local

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
