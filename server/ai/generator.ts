/**
 * Generador con rotación de modelos y fallback automático.
 *
 * La cadena de modelos se define ÚNICAMENTE mediante variables de entorno:
 *   DEFAULT_MODEL    → modelo principal (default: deepseek/deepseek-chat)
 *   FALLBACK_MODELS  → lista separada por comas, en orden de prioridad
 *                      (default: qwen/qwen3,anthropic/claude)
 *
 * Orden efectivo por defecto:
 *   1. deepseek/deepseek-chat
 *   2. qwen/qwen3
 *   3. anthropic/claude
 *
 * Si un modelo devuelve 429, 503 o timeout, el evento se registra y se
 * intenta automáticamente el siguiente modelo (sin pausa adicional).
 * Cualquier otro error también avanza al siguiente modelo, con una pausa
 * breve. Los modelos que el proveedor activo no puede servir, o que no
 * soportan imágenes cuando la consulta las incluye, se omiten con registro.
 */
import type { AIProvider, AINormalizedMessage } from "./types";
import { isOverloadOrTimeout, modelSupportsVision } from "./providers";

export interface ModelPool {
  primary: string;
  fallbacks: string[];
  /** primary + fallbacks, deduplicados y en orden de prioridad. */
  all: string[];
}

export function readModelPool(env: NodeJS.ProcessEnv): ModelPool {
  const primary = (env.DEFAULT_MODEL || "deepseek/deepseek-chat").trim();
  const fallbacks = (env.FALLBACK_MODELS || "qwen/qwen3,anthropic/claude")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const all = [primary, ...fallbacks].filter(
    (model, index, arr) => model && arr.indexOf(model) === index
  );
  return { primary, fallbacks, all };
}

export interface FallbackGenerateParams {
  messages: AINormalizedMessage[];
  systemInstruction: string;
  temperature?: number;
}

export interface FallbackGeneratorOptions {
  /** Ciclos completos sobre el pool (default: 2, como la lógica original). */
  cycles?: number;
  /** Pausa entre ciclos (ms). */
  sleepMs?: number;
  /** Pausa breve para errores transitorios que no son sobrecarga (ms). */
  retryDelayMs?: number;
  /** Función de log (default: console.warn). */
  log?: (message: string) => void;
}

export interface FallbackGenerator {
  readonly pool: ModelPool;
  generate(params: FallbackGenerateParams): Promise<string>;
}

export function createFallbackGenerator(
  provider: AIProvider,
  env: NodeJS.ProcessEnv,
  options: FallbackGeneratorOptions = {}
): FallbackGenerator {
  const pool = readModelPool(env);
  const cycles = options.cycles ?? Math.max(1, Number(env.AI_FALLBACK_CYCLES || 2));
  const retryDelayMs = options.retryDelayMs ?? 300;
  const cycleDelayMs = options.sleepMs ?? 800;
  const log = options.log ?? ((message: string) => console.warn(message));
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const requestHasImages = (messages: AINormalizedMessage[]) =>
    messages.some((m) => m.images && m.images.length > 0);

  return {
    pool,

    async generate(params: FallbackGenerateParams): Promise<string> {
      const { messages, systemInstruction, temperature = 0.4 } = params;
      const withImages = requestHasImages(messages);
      let lastError: unknown = null;

      for (let cycle = 1; cycle <= cycles; cycle++) {
        for (const model of pool.all) {
          if (!provider.canServe(model)) {
            log(
              `[Tutor-SIG] El proveedor "${provider.name}" no sirve el modelo "${model}" — se omite.`
            );
            continue;
          }
          if (withImages && !modelSupportsVision(model)) {
            log(
              `[Tutor-SIG] El modelo "${model}" es de texto plano — se omite para consultas con imágenes.`
            );
            continue;
          }

          try {
            const start = Date.now();
            const text = await provider.generate({
              model,
              messages,
              systemInstruction,
              temperature,
            });
            log(
              `[Tutor-SIG] Modelo "${model}" (${provider.name}) respondió en ${Date.now() - start} ms.`
            );
            return text;
          } catch (error: any) {
            lastError = error;
            const errMsg = error?.message || String(error);
            log(
              `[Tutor-SIG] Modelo "${model}" (${provider.name}, ciclo ${cycle}/${cycles}) falló: ${errMsg}`
            );

            // 429 / 503 / timeout: pasar inmediatamente al siguiente modelo.
            if (!isOverloadOrTimeout(errMsg)) {
              await sleep(retryDelayMs);
            }
          }
        }

        if (cycle < cycles) {
          log(
            `[Tutor-SIG] Todos los modelos del pool fallaron en el ciclo ${cycle}/${cycles} — reintentando...`
          );
          await sleep(cycleDelayMs);
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error(
            "Los servidores de IA se encuentran con alta demanda temporal. Por favor reintenta en unos instantes."
          );
    },
  };
}
