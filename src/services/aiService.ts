/**
 * aiService — ÚNICO punto de comunicación del frontend con el backend.
 *
 * Ningún componente React debe llamar a fetch() directamente: toda la
 * interacción con la IA pasa por estas funciones, que hablan con los
 * endpoints de Express (/api/*). El servidor decide proveedor y modelos
 * mediante variables de entorno, así que cambiar de modelo (OpenRouter,
 * DeepSeek, Gemini, Claude, Ollama) NUNCA requiere modificar la interfaz.
 *
 * Las claves de API viven exclusivamente del lado del servidor; este
 * servicio no conoce ninguna credencial.
 */

/** Base de la API. Por defecto mismo origen; configurable en despliegues especiales. */
const API_BASE: string = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? "";

export type ChatRole = "user" | "model";

export interface ChatServiceMessage {
  role: ChatRole;
  content: string;
  imageBase64?: string;
  imageMime?: string;
}

export interface ChatRequestOptions {
  software?: string;
  contextUnit?: string;
  discipline?: string;
}

export interface EvaluateRequest {
  title?: string;
  description?: string;
  imageBase64?: string;
  imageMime?: string;
  software?: string;
  scale?: string;
  datum?: string;
}

export interface TeacherToolRequest {
  toolType: "lab_guide" | "rubric" | "case_study";
  topic: string;
  unit?: string;
  software?: string;
  studyArea?: string;
  targetAudience?: string;
}

export interface GeoprocessFlowRequest {
  problemDescription: string;
  software?: string;
}

export interface HealthInfo {
  status: string;
  tutor: string;
  author: string;
}

/** Identidad institucional del despliegue (proviene del servidor). */
export interface AppConfig {
  tutorName: string;
  institution: string;
  author: string;
  portalUrl: string;
}

/** Petición genérica con manejo uniforme de errores del servidor. */
async function apiRequest<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: body !== undefined ? "POST" : "GET",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(
      "No fue posible conectar con el servidor de Tutor-SIG. Verifica tu conexión."
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const serverError =
      data?.error || `Error ${response.status}: ${response.statusText}`;
    throw new Error(serverError);
  }
  return data as T;
}

/** Conversación general con Tutor-SIG (admite imágenes en base64). */
export async function chatWithTutor(
  messages: ChatServiceMessage[],
  options: ChatRequestOptions = {}
): Promise<string> {
  const data = await apiRequest<{ text?: string }>("/api/chat", {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      imageBase64: m.imageBase64,
      imageMime: m.imageMime,
    })),
    contextUnit: options.contextUnit,
    software: options.software,
    discipline: options.discipline,
  });
  return data.text || "No se generó respuesta.";
}

/** Evaluación pedagógica de entregables / mapas (rúbrica de 5 criterios). */
export async function evaluateDeliverable(request: EvaluateRequest): Promise<string> {
  const data = await apiRequest<{ evaluation?: string }>("/api/evaluate", request);
  return data.evaluation || "No se generó retroalimentación.";
}

/** Material docente: guías de laboratorio, rúbricas y estudios de caso. */
export async function generateTeacherTool(
  request: TeacherToolRequest
): Promise<string> {
  const data = await apiRequest<{ result?: string }>("/api/teacher-tool", request);
  return data.result || "No se generó el contenido.";
}

/** Diseño de flujos metodológicos de geoprocesamiento. */
export async function generateGeoprocessFlow(
  request: GeoprocessFlowRequest
): Promise<string> {
  const data = await apiRequest<{ flow?: string }>("/api/geoprocess-flow", request);
  return data.flow || "No se generó el flujo.";
}

/** Estado del servidor. */
export async function getHealth(): Promise<HealthInfo> {
  return apiRequest<HealthInfo>("/api/health");
}

/** Configuración pública del despliegue (marca institucional). */
export async function getAppConfig(): Promise<AppConfig> {
  return apiRequest<AppConfig>("/api/config");
}
