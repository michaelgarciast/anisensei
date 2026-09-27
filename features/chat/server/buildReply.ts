import "server-only";
import { streamText, type ModelMessage } from "ai";
import { llmModel } from "@/lib/llmClient";
import type { AnimeSearchResult } from "@/features/anime/schemas";
import type { ChatIntent } from "../types";

const SYSTEM_PROMPT = `Eres AniChat, un asistente conversacional experto en anime.

Tienes dos fuentes de conocimiento:
1. Una lista de resultados de búsqueda de AniList adjunta en el contexto (usada para mostrar tarjetas visuales).
2. Tu propio y vasto conocimiento interno sobre anime.

Reglas:
- Si el usuario hace preguntas sobre autores, estudios, creadores, OVAs, curiosidades o animes similares a uno específico, USA TU CONOCIMIENTO INTERNO para responderle detalladamente de forma útil y amigable.
- Si hay resultados de AniList en el contexto, puedes referirte a ellos (el usuario verá tarjetas visuales de esos resultados).
- NO limites tus respuestas solo a los resultados de AniList si la pregunta del usuario es más profunda o requiere datos como el nombre del autor, fechas exactas, OVAs, etc. Eres libre de usar tu conocimiento general.
- Adapta el tono de tu redacción al valor de "tone" que se te indique.
- No repitas la lista completa de datos de AniList en texto; asume que el usuario las está viendo visualmente.
- Si el usuario busca recomendaciones parecidas a una obra, nombra las series que consideres similares usando tu conocimiento, y si coinciden con los resultados de AniList, mucho mejor.`;

export interface BuildReplyInput {
  message: string;
  history?: ModelMessage[];
  intent: ChatIntent;
  results: AnimeSearchResult;
}

function formatResultsForContext(results: AnimeSearchResult): string {
  if (results.data.length === 0) return "Sin resultados.";

  return results.data
    .map((anime) => {
      const title = anime.title.english ?? anime.title.romaji;
      const genres = anime.genres.join(", ") || "sin géneros listados";
      const score = anime.averageScore != null ? `${anime.averageScore}/100` : "N/A";
      return `- ${title} (${anime.seasonYear ?? "año desconocido"}) — score: ${score} — géneros: ${genres}`;
    })
    .join("\n");
}

export function buildReply({ message, history = [], intent, results }: BuildReplyInput) {
  const context = `Intención detectada: ${intent.intent}
Tono solicitado: ${intent.tone}
Filtros: ${JSON.stringify(intent.filters)}

Resultados de AniList:
${formatResultsForContext(results)}`;

  return streamText({
    model: llmModel,
    maxOutputTokens: 768,
    timeout: { totalMs: 12_000 },
    system: SYSTEM_PROMPT,
    messages: [
      ...history,
      { role: "user", content: `${message}\n\n[Contexto interno]\n${context}` },
    ],
  });
}
