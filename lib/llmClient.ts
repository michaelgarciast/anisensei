import "server-only";
import { google } from "@ai-sdk/google";

// Usar siempre desde código de servidor (Route Handlers, Server Components, etc.).
// El plan gratuito limita las peticiones diarias por modelo (y a veces un modelo
// responde 503), así que se prueban varios en orden hasta que uno responda.
const MODEL_IDS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
] as const;
type Model = ReturnType<typeof google>;
const models = MODEL_IDS.map((id) => google(id));

// Modelos con cuota agotada: se omiten hasta que pase el enfriamiento para no
// gastar tiempo ni peticiones en reintentos que seguro fallarán.
// Se guarda en globalThis para que sobreviva al HMR de `next dev`.
const globalState = globalThis as { __llmCooldown?: Map<string, number> };
const cooldownUntil = (globalState.__llmCooldown ??= new Map<string, number>());

function describeError(error: unknown) {
  const e = error as { statusCode?: number; lastError?: { statusCode?: number }; message?: string };
  const status = e?.statusCode ?? e?.lastError?.statusCode;
  const message = e?.message ?? String(error);
  return { status, message, daily: /PerDay|retry in \d+h/i.test(message) };
}

function cooldownMs(status: number | undefined, daily: boolean) {
  if (status === 404) return 86_400_000;
  if (status === 503) return 30_000;
  if (status === 429) return daily ? 3_600_000 : 60_000;
  return 0;
}

async function withFallback<T>(run: (model: Model) => PromiseLike<T>): Promise<T> {
  let lastError: unknown;
  const now = Date.now();
  const available = models.filter((m) => (cooldownUntil.get(m.modelId) ?? 0) <= now);
  for (const model of available.length ? available : models) {
    try {
      return await run(model);
    } catch (error) {
      lastError = error;
      const { status, message, daily } = describeError(error);
      const cooldown = cooldownMs(status, daily);
      if (cooldown) cooldownUntil.set(model.modelId, Date.now() + cooldown);
      const reason = status === 429 ? "cuota agotada" : message.split(/[.\n]/)[0];
      console.warn(`Modelo ${model.modelId} falló (${status ?? "sin estado"}: ${reason}), probando el siguiente`);
    }
  }
  throw lastError;
}

export const llmModel: Model = {
  ...models[0],
  provider: "google-fallback",
  modelId: MODEL_IDS[0],
  supportedUrls: models[0].supportedUrls,
  doGenerate: (options) => withFallback((model) => model.doGenerate(options)),
  doStream: (options) => withFallback((model) => model.doStream(options)),
};

// Gemini 3 "piensa" por defecto y esos tokens cuentan contra maxOutputTokens,
// truncando la respuesta. Para chat/intents basta con razonamiento mínimo.
export const llmProviderOptions = {
  google: { thinkingConfig: { thinkingLevel: "minimal" } },
} as const;
