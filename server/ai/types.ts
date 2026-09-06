/**
 * Capa de abstracción de proveedores de IA — Tutor-SIG.
 *
 * El resto del proyecto nunca habla directamente con un proveedor:
 * los mensajes se normalizan a este formato y cada proveedor
 * (OpenRouter, DeepSeek, Gemini, Claude, Ollama) los traduce a su
 * propio protocolo en `providers.ts`.
 */

/** Imagen ya decodificada (base64 puro, sin el prefijo `data:image/...;base64,`). */
export interface AIImagePart {
  data: string;
  mimeType: string;
}

/** Mensaje normalizado e independiente del proveedor. */
export interface AINormalizedMessage {
  role: "user" | "assistant";
  text: string;
  images?: AIImagePart[];
}

export interface AIGenerateParams {
  model: string;
  messages: AINormalizedMessage[];
  systemInstruction: string;
  temperature: number;
}

/** Contrato mínimo que debe cumplir todo proveedor de IA. */
export interface AIProvider {
  /** Nombre legible para logs (p. ej. "openrouter"). */
  readonly name: string;
  /** Indica si este proveedor puede servir un identificador de modelo dado. */
  canServe(model: string): boolean;
  /** Genera una respuesta de texto a partir de los mensajes normalizados. */
  generate(params: AIGenerateParams): Promise<string>;
}

/**
 * Identidad institucional del tutor. Configurable por variables de entorno
 * para preparar despliegues multi-institución (p. ej. Tutor-SIG CESMAG)
 * sin tocar código.
 */
export interface TutorIdentity {
  tutorName: string;
  institution: string;
  author: string;
  /** Portal web institucional (enlace del encabezado y pie de página). */
  portalUrl: string;
}
