import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type ModelMessage,
} from "ai";
import { interpretIntent } from "@/features/chat/server/interpretIntent";
import { buildReply } from "@/features/chat/server/buildReply";
import { searchAnime } from "@/features/anime/server/searchAnime";
import { getSeasonalAnime } from "@/features/anime/server/getSeasonalAnime";
import type { AnimeSearchResult } from "@/features/anime/schemas";
import type { ChatIntent } from "@/features/chat/types";
import { ChatRequestSchema, MAX_CHAT_BODY_BYTES } from "@/features/chat/schemas";

export const maxDuration = 30;

const EMPTY_RESULTS: AnimeSearchResult = {
  data: [],
  pagination: { last_page: 1, has_next_page: false, total: 0, current_page: 1 },
};

async function readChatBody(req: Request): Promise<unknown | Response> {
  const contentLength = Number(req.headers.get("content-length"));
  if (contentLength > MAX_CHAT_BODY_BYTES)
    return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  if (!req.body) return Response.json({ error: "Cuerpo vacío" }, { status: 400 });

  const reader = req.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let text = "";
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CHAT_BODY_BYTES) {
        await reader.cancel();
        return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
}

// AniList tiene filtros separados: `search` busca por título y `genre` espera
// el nombre canónico en inglés ("Action", "Romance"...). El prompt de
// interpretIntent ya pide el género en ese formato. `mood` no tiene equivalente
// en la API y solo afecta al tono de la respuesta.
function buildSearchQuery(intent: ChatIntent): string | undefined {
  return intent.filters.similarTo || undefined;
}

// Resuelve qué llamada a AniList corresponde según la intención detectada.
// "detail" reutiliza la búsqueda por texto libre: resolver un anime puntual
// por nombre a su id de AniList queda para una iteración futura.
async function fetchAnimeForIntent(intent: ChatIntent): Promise<AnimeSearchResult> {
  if (intent.intent === "smalltalk") return EMPTY_RESULTS;
  if (intent.intent === "seasonal") return getSeasonalAnime({ limit: 6 });

  return searchAnime({
    query: buildSearchQuery(intent),
    genre: intent.filters.genre,
    year: intent.filters.year,
    limit: 6,
  });
}

export async function POST(req: Request) {
  if (req.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return Response.json({ error: "Se requiere application/json" }, { status: 415 });
  }
  const body = await readChatBody(req);
  if (body instanceof Response) return body;
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Mensajes inválidos" }, { status: 400 });

  const messages = parsed.data.messages;
  const messageText = messages
    .at(-1)!
    .parts.map((part) => part.text)
    .join("")
    .trim();
  const history: ModelMessage[] = messages.slice(0, -1).map((message) => ({
    role: message.role,
    content: message.parts.map((part) => part.text).join(""),
  }));

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const intent = await interpretIntent({ message: messageText, history });

      let results: AnimeSearchResult;
      try {
        results = await fetchAnimeForIntent(intent);
      } catch (error) {
        // Fallback conversacional: si AniList falla, seguimos sin datos en vez
        // de romper el chat; buildReply ya sabe responder con honestidad
        // cuando no hay resultados.
        console.error("No se pudieron obtener datos de AniList:", error);
        results = EMPTY_RESULTS;
      }

      if (results.data.length > 0) {
        writer.write({ type: "data-anime-results", id: "anime-results", data: results.data });
      }

      const reply = buildReply({ message: messageText, history, intent, results });
      writer.merge(toUIMessageStream({ stream: reply.stream }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
