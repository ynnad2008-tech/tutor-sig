/**
 * Implementaciones de los proveedores de IA.
 *
 * La selección del proveedor y de los modelos se realiza ÚNICAMENTE
 * mediante variables de entorno (ver .env.example):
 *
 * - openrouter: API OpenAI-compatible (https://openrouter.ai/api/v1) — PROVEEDOR PRIORITARIO.
 * - deepseek:   API OpenAI-compatible directa (https://api.deepseek.com).
 * - gemini:     SDK oficial @google/genai (compatibilidad).
 * - claude:     API de mensajes de Anthropic (preparado para integración).
 * - ollama:     API nativa local (preparado para integración).
 *
 * Todas las claves viven exclusivamente del lado del servidor.
 */
import { GoogleGenAI } from "@google/genai";
import type {
  AIProvider,
  AIGenerateParams,
  AINormalizedMessage,
} from "./types";

// ---------------------------------------------------------------------------
// Configuración desde variables de entorno
// ---------------------------------------------------------------------------

const DEFAULT_OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_DEEPSEEK_BASE = "https://api.deepseek.com";
const DEFAULT_ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const DEFAULT_OLLAMA_BASE = "http://localhost:11434";

export interface ProviderConfig {
  modelProvider: string;
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  deepSeekApiKey: string;
  deepSeekBaseUrl: string;
  geminiApiKey: string;
  anthropicApiKey: string;
  anthropicBaseUrl: string;
  ollamaBaseUrl: string;
  requestTimeoutMs: number;
  appUrl?: string;
}

export function readProviderConfig(env: NodeJS.ProcessEnv): ProviderConfig {
  return {
    modelProvider: (env.MODEL_PROVIDER || "openrouter").trim().toLowerCase(),
    openRouterApiKey: env.OPENROUTER_API_KEY || "",
    openRouterBaseUrl: env.OPENROUTER_BASE_URL || DEFAULT_OPENROUTER_BASE,
    deepSeekApiKey: env.DEEPSEEK_API_KEY || "",
    deepSeekBaseUrl: env.DEEPSEEK_BASE_URL || DEFAULT_DEEPSEEK_BASE,
    geminiApiKey: env.GEMINI_API_KEY || "",
    anthropicApiKey: env.ANTHROPIC_API_KEY || "",
    anthropicBaseUrl: env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_BASE,
    ollamaBaseUrl: env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE,
    requestTimeoutMs: Number(env.AI_REQUEST_TIMEOUT_MS || 120000),
    appUrl: env.APP_URL || undefined,
  };
}

// ---------------------------------------------------------------------------
// Utilidades compartidas
// ---------------------------------------------------------------------------

function withTimeout(timeoutMs: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/** Detecta los errores que NO requieren pausa entre modelos (429/503/timeout). */
export function isOverloadOrTimeout(message: string): boolean {
  return /503|429|timeout|timed out|unavailable|high demand|resourceexhausted|etimedout|aborted|fetch failed/i.test(
    message
  );
}

/**
 * Heurística de soporte visual por modelo.
 * Los modelos de texto plano no reciben imágenes: el generador registra el
 * evento y salta automáticamente al siguiente modelo del pool (la imagen
 * llega al primer modelo multimodal disponible).
 */
export function modelSupportsVision(model: string): boolean {
  if (model.startsWith("deepseek")) return false; // deepseek-chat / deepseek-reasoner son solo texto
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Proveedor OpenAI-compatible (OpenRouter y DeepSeek directo)
// ---------------------------------------------------------------------------

type OpenAICompatibleContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

function toOpenAICompatibleMessages(
  messages: AINormalizedMessage[],
  systemInstruction: string
): Array<{ role: string; content: OpenAICompatibleContent }> {
  const result: Array<{ role: string; content: OpenAICompatibleContent }> = [
    { role: "system", content: systemInstruction },
  ];
  for (const m of messages) {
    const role = m.role === "assistant" ? "assistant" : "user";
    if (m.images && m.images.length > 0) {
      const content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      > = [{ type: "text", text: m.text || "Analiza esta imagen o mapa adjunto." }];
      for (const img of m.images) {
        content.push({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` },
        });
      }
      result.push({ role, content });
    } else {
      result.push({ role, content: m.text });
    }
  }
  return result;
}

class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly extraHeaders: Record<string, string>;
  private readonly modelFilter?: (model: string) => boolean;

  constructor(options: {
    name: string;
    baseUrl: string;
    apiKey: string;
    timeoutMs: number;
    headers?: Record<string, string>;
    modelFilter?: (model: string) => boolean;
  }) {
    this.name = options.name;
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs;
    this.extraHeaders = options.headers ?? {};
    this.modelFilter = options.modelFilter;
  }

  canServe(model: string): boolean {
    return this.modelFilter ? this.modelFilter(model) : true;
  }

  async generate(params: AIGenerateParams): Promise<string> {
    const { signal, cleanup } = withTimeout(this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          ...this.extraHeaders,
        },
        body: JSON.stringify({
          model: params.model,
          temperature: params.temperature,
          messages: toOpenAICompatibleMessages(params.messages, params.systemInstruction),
        }),
        signal,
      });

      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail =
          data?.error?.message || response.statusText || "error del proveedor";
        throw new Error(`HTTP ${response.status}: ${detail}`);
      }

      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return text;
      throw new Error("El modelo devolvió una respuesta vacía");
    } catch (error) {
      if (isAbortError(error)) {
        throw new Error(`timeout tras ${this.timeoutMs}ms (${this.name})`);
      }
      throw error;
    } finally {
      cleanup();
    }
  }
}

// ---------------------------------------------------------------------------
// Proveedor Gemini (SDK oficial — compatibilidad futura)
// ---------------------------------------------------------------------------

class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private readonly client: GoogleGenAI;
  private readonly timeoutMs: number;

  constructor(apiKey: string, timeoutMs: number) {
    this.client = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });
    this.timeoutMs = timeoutMs;
  }

  canServe(model: string): boolean {
    return /^gemini/i.test(model);
  }

  async generate(params: AIGenerateParams): Promise<string> {
    const call = this.client.models.generateContent({
      model: params.model,
      contents: params.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          ...(m.images?.map((img) => ({
            inlineData: { data: img.data, mimeType: img.mimeType },
          })) ?? []),
          { text: m.text },
        ],
      })),
      config: {
        systemInstruction: params.systemInstruction,
        temperature: params.temperature,
      },
    });

    const response = await Promise.race([
      call,
      sleep(this.timeoutMs).then(() => {
        throw new Error(`timeout tras ${this.timeoutMs}ms (gemini)`);
      }),
    ]);

    if (response.text) return response.text;
    throw new Error("El modelo Gemini devolvió una respuesta vacía");
  }
}

// ---------------------------------------------------------------------------
// Proveedor Claude (Anthropic — preparado para integración)
// ---------------------------------------------------------------------------

class AnthropicProvider implements AIProvider {
  readonly name = "claude";
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(options: { baseUrl: string; apiKey: string; timeoutMs: number }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs;
  }

  canServe(model: string): boolean {
    return model.startsWith("claude");
  }

  async generate(params: AIGenerateParams): Promise<string> {
    const { signal, cleanup } = withTimeout(this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: params.model,
          max_tokens: 4096,
          temperature: params.temperature,
          system: params.systemInstruction,
          messages: params.messages.map((m) => {
            if (m.images && m.images.length > 0) {
              return {
                role: m.role,
                content: [
                  ...m.images.map((img) => ({
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: img.mimeType,
                      data: img.data,
                    },
                  })),
                  { type: "text", text: m.text || "Analiza esta imagen o mapa adjunto." },
                ],
              };
            }
            return { role: m.role, content: m.text };
          }),
        }),
        signal,
      });

      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail =
          data?.error?.message || response.statusText || "error del proveedor";
        throw new Error(`HTTP ${response.status}: ${detail}`);
      }

      const text = Array.isArray(data?.content)
        ? data.content
            .filter((block: any) => block?.type === "text")
            .map((block: any) => block.text)
            .join("")
        : "";
      if (text.trim()) return text;
      throw new Error("El modelo Claude devolvió una respuesta vacía");
    } catch (error) {
      if (isAbortError(error)) {
        throw new Error(`timeout tras ${this.timeoutMs}ms (claude)`);
      }
      throw error;
    } finally {
      cleanup();
    }
  }
}

// ---------------------------------------------------------------------------
// Proveedor Ollama (local — preparado para integración)
// ---------------------------------------------------------------------------

class OllamaProvider implements AIProvider {
  readonly name = "ollama";
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: { baseUrl: string; timeoutMs: number }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs;
  }

  /** Ollama sirve cualquier modelo instalado localmente (definido por el usuario). */
  canServe(_model: string): boolean {
    return true;
  }

  async generate(params: AIGenerateParams): Promise<string> {
    const { signal, cleanup } = withTimeout(this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: params.model,
          stream: false,
          options: { temperature: params.temperature },
          messages: [
            { role: "system", content: params.systemInstruction },
            ...params.messages.map((m) => ({
              role: m.role,
              content: m.text || "Analiza esta imagen o mapa adjunto.",
              ...(m.images?.length
                ? { images: m.images.map((img) => img.data) }
                : {}),
            })),
          ],
        }),
        signal,
      });

      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail =
          data?.error || response.statusText || "error del proveedor";
        throw new Error(`HTTP ${response.status}: ${detail}`);
      }

      const text = data?.message?.content;
      if (typeof text === "string" && text.trim()) return text;
      throw new Error("El modelo Ollama devolvió una respuesta vacía");
    } catch (error) {
      if (isAbortError(error)) {
        throw new Error(`timeout tras ${this.timeoutMs}ms (ollama)`);
      }
      throw error;
    } finally {
      cleanup();
    }
  }
}

// ---------------------------------------------------------------------------
// Fábrica principal
// ---------------------------------------------------------------------------

/**
 * Crea el proveedor activo según MODEL_PROVIDER.
 * Lanza error al arrancar si la variable no es reconocida (fail-fast).
 */
export function createProviderFromEnv(env: NodeJS.ProcessEnv): AIProvider {
  const config = readProviderConfig(env);

  switch (config.modelProvider) {
    case "openrouter":
      return new OpenAICompatibleProvider({
        name: "openrouter",
        baseUrl: config.openRouterBaseUrl,
        apiKey: config.openRouterApiKey,
        timeoutMs: config.requestTimeoutMs,
        headers: {
          "HTTP-Referer": config.appUrl || "https://www.umariana.edu.co",
          "X-Title": "Tutor-SIG",
        },
      });
    case "deepseek":
      return new OpenAICompatibleProvider({
        name: "deepseek",
        baseUrl: config.deepSeekBaseUrl,
        apiKey: config.deepSeekApiKey,
        timeoutMs: config.requestTimeoutMs,
        modelFilter: (model) => model.startsWith("deepseek"),
      });
    case "gemini":
      return new GeminiProvider(config.geminiApiKey, config.requestTimeoutMs);
    case "claude":
    case "anthropic":
      return new AnthropicProvider({
        baseUrl: config.anthropicBaseUrl,
        apiKey: config.anthropicApiKey,
        timeoutMs: config.requestTimeoutMs,
      });
    case "ollama":
      return new OllamaProvider({
        baseUrl: config.ollamaBaseUrl,
        timeoutMs: config.requestTimeoutMs,
      });
    default:
      throw new Error(
        `MODEL_PROVIDER no reconocido: "${config.modelProvider}". ` +
          "Valores válidos: openrouter, deepseek, gemini, claude, ollama."
      );
  }
}
