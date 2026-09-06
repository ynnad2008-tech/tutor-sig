import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { pathToFileURL } from "url";

// Carga de variables de entorno. .env.local tiene prioridad sobre .env;
// las variables ya presentes en process.env (p. ej. secretos inyectados
// por AI Studio) nunca se sobrescriben.
dotenv.config({ path: [".env.local", ".env"] });

import { createProviderFromEnv } from "./server/ai/providers";
import { createFallbackGenerator } from "./server/ai/generator";
import {
  buildEvaluatePrompt,
  buildGeoprocessFlowPrompt,
  buildSystemInstruction,
  buildTeacherToolPrompt,
  readTutorIdentity,
} from "./server/prompts";
import type { AINormalizedMessage } from "./server/ai/types";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "50mb" }));

// ---------------------------------------------------------------------------
// Capa de IA desacoplada: el proveedor y la cadena de modelos se configuran
// ÚNICAMENTE mediante variables de entorno (MODEL_PROVIDER, DEFAULT_MODEL,
// FALLBACK_MODELS). Las claves nunca salen del servidor.
// ---------------------------------------------------------------------------
const provider = createProviderFromEnv(process.env);
const fallback = createFallbackGenerator(provider, process.env);
const identity = readTutorIdentity(process.env);
const systemInstruction = buildSystemInstruction(identity);

console.log(
  `[Tutor-SIG] Proveedor IA: ${provider.name} | Modelo principal: ${fallback.pool.primary} | ` +
    `Fallback: ${fallback.pool.fallbacks.join(", ") || "ninguno"}`
);

// Normaliza los mensajes del cliente (base64 con prefijo data:) al formato
// interno independiente del proveedor.
function toAINormalizedMessages(messages: any[]): AINormalizedMessage[] {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    text: typeof m.content === "string" ? m.content : "",
    images: m.imageBase64
      ? [
          {
            data: String(m.imageBase64).replace(/^data:image\/\w+;base64,/, ""),
            mimeType: m.imageMime || "image/png",
          },
        ]
      : undefined,
  }));
}

// API route: General Chat with Tutor-SIG
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, contextUnit, software, discipline } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    let additionalContext = "";
    if (contextUnit) additionalContext += `\nUnidad temática prioritaria: ${contextUnit}`;
    if (software) additionalContext += `\nSoftware/Plataforma de interés: ${software}`;
    if (discipline) additionalContext += `\nContexto disciplinar: ${discipline}`;

    const text = await fallback.generate({
      messages: toAINormalizedMessages(messages),
      systemInstruction:
        systemInstruction +
        (additionalContext ? `\n\nContexto actual del usuario:${additionalContext}` : ""),
      temperature: 0.4,
    });

    res.json({
      text: text || "No se generó respuesta.",
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Error procesando la consulta con Tutor-SIG",
    });
  }
});

// API route: Specialized Map & Deliverable Evaluator (5 Points)
app.post("/api/evaluate", async (req, res) => {
  try {
    const { title, description, imageBase64, imageMime, software, scale, datum } = req.body;

    const promptText = buildEvaluatePrompt({ title, description, software, scale, datum });

    const evaluation = await fallback.generate({
      messages: [
        {
          role: "user",
          text: promptText,
          images: imageBase64
            ? [
                {
                  data: String(imageBase64).replace(/^data:image\/\w+;base64,/, ""),
                  mimeType: imageMime || "image/png",
                },
              ]
            : undefined,
        },
      ],
      systemInstruction,
      temperature: 0.3,
    });

    res.json({ evaluation });
  } catch (error: any) {
    console.error("Error in /api/evaluate:", error);
    res.status(500).json({ error: error.message || "Error al evaluar el mapa" });
  }
});

// API route: Teacher Mode - Lab Guides & Rubrics Generator
app.post("/api/teacher-tool", async (req, res) => {
  try {
    const { toolType, topic, unit, software, studyArea, targetAudience } = req.body;

    const prompt = buildTeacherToolPrompt({
      toolType,
      topic,
      unit,
      software,
      studyArea,
      targetAudience,
    });

    const result = await fallback.generate({
      messages: [{ role: "user", text: prompt }],
      systemInstruction,
      temperature: 0.4,
    });

    res.json({ result });
  } catch (error: any) {
    console.error("Error in /api/teacher-tool:", error);
    res.status(500).json({ error: error.message || "Error generando material docente" });
  }
});

// API route: Quick Geoprocess Flow Builder
app.post("/api/geoprocess-flow", async (req, res) => {
  try {
    const { problemDescription, software } = req.body;

    const prompt = buildGeoprocessFlowPrompt({ problemDescription, software });

    const flow = await fallback.generate({
      messages: [{ role: "user", text: prompt }],
      systemInstruction,
      temperature: 0.3,
    });

    res.json({ flow });
  } catch (error: any) {
    console.error("Error in /api/geoprocess-flow:", error);
    res.status(500).json({ error: error.message || "Error al generar flujo" });
  }
});

// API route: Public app configuration (identidad institucional del despliegue).
// Permite que un mismo código muestre la marca de cada institución según las
// variables de entorno del servidor (p. ej. Universidad Mariana en AI Studio,
// Universidad CESMAG en Render).
app.get("/api/config", (_req, res) => {
  res.json({
    tutorName: identity.tutorName,
    institution: identity.institution,
    author: identity.author,
    portalUrl: identity.portalUrl,
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", tutor: "Tutor-SIG", author: "geógr. Dany Benavides Bolaños" });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tutor-SIG server running on http://0.0.0.0:${PORT}`);
  });
}

// Solo inicia el servidor cuando este archivo es el módulo principal
// (permite importar `app` desde pruebas sin abrir el puerto).
// Funciona tanto en ESM (tsx, vía import.meta.url) como en el bundle CJS
// de producción (vía require.main === module).
function isMainModule(): boolean {
  if (!process.argv[1]) return false;
  if (typeof require !== "undefined" && require.main === module) return true;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMainModule()) {
  startServer();
}

export { app };
