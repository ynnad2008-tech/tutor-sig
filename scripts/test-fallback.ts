/**
 * Prueba E2E del fallback de modelos SIN claves reales.
 *
 * Levanta un mock de la API de OpenRouter y verifica que:
 *   1. deepseek/deepseek-chat responde 429 → se registra el evento y se salta.
 *   2. qwen/qwen3 responde 200 → se usa la respuesta.
 *   3. anthropic/claude nunca se intenta (la cadena se detiene al primer éxito).
 *   4. /api/chat conserva su contrato { text }.
 *
 * Ejecutar: npm run test:fallback
 */
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

// ---------------------------------------------------------------------------
// 1. Mock de OpenRouter
// ---------------------------------------------------------------------------
const requests: Array<{ model: string; status: number }> = [];

const mock: Server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const parsed = JSON.parse(body || "{}");
    const model: string = parsed.model ?? "";
    const entry = { model, status: 0 };
    requests.push(entry);

    if (model === "deepseek/deepseek-chat") {
      entry.status = 429;
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "rate limited (mock)" } }));
    } else if (model === "qwen/qwen3") {
      entry.status = 200;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          choices: [{ message: { role: "assistant", content: "FALLBACK_OK_QWEN" } }],
        })
      );
    } else {
      entry.status = 500;
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "modelo inesperado (mock)" } }));
    }
  });
});

await new Promise<void>((resolve) => mock.listen(0, "127.0.0.1", resolve));
const mockPort = (mock.address() as AddressInfo).port;

// ---------------------------------------------------------------------------
// 2. Configura el entorno ANTES de importar server.ts
// ---------------------------------------------------------------------------
process.env.MODEL_PROVIDER = "openrouter";
process.env.OPENROUTER_API_KEY = "test-key";
process.env.OPENROUTER_BASE_URL = `http://127.0.0.1:${mockPort}/v1`;
process.env.DEFAULT_MODEL = "deepseek/deepseek-chat";
process.env.FALLBACK_MODELS = "qwen/qwen3,anthropic/claude";

const { app } = await import("../server.ts");
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const port = (server.address() as AddressInfo).port;

// ---------------------------------------------------------------------------
// 3. Verificaciones
// ---------------------------------------------------------------------------
const health = (await fetch(`http://127.0.0.1:${port}/api/health`).then((r) =>
  r.json()
)) as { status?: string };

const chatResponse = await fetch(`http://127.0.0.1:${port}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hola Tutor-SIG" }],
    software: "QGIS",
  }),
});
const chatData = (await chatResponse.json()) as { text?: string };

console.log("health:", JSON.stringify(health));
console.log("chat status:", chatResponse.status, "| body:", JSON.stringify(chatData));
console.log(
  "mock recibió:",
  requests.map((r) => `${r.model} → ${r.status}`).join(", ") || "(nada)"
);

const pass =
  health.status === "ok" &&
  chatResponse.status === 200 &&
  chatData.text === "FALLBACK_OK_QWEN" &&
  requests.length === 2 &&
  requests[0].model === "deepseek/deepseek-chat" &&
  requests[0].status === 429 &&
  requests[1].model === "qwen/qwen3" &&
  requests[1].status === 200;

console.log(pass ? "\n✅ TEST FALLBACK: PASÓ" : "\n❌ TEST FALLBACK: FALLÓ");

// Cierre ordenado de servidores (evita aserciones de libuv en Windows).
(server as any).closeAllConnections?.();
(mock as any).closeAllConnections?.();
server.close();
mock.close();
await new Promise((resolve) => setTimeout(resolve, 150));
process.exit(pass ? 0 : 1);
