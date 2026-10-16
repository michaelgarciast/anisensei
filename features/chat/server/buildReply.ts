import "server-only";
import { streamText, type ModelMessage } from "ai";
import { llmModel, llmProviderOptions } from "@/lib/llmClient";
import type { AnimeSearchResult } from "@/features/anime/schemas";
import type { NewsItem } from "@/features/news/schemas";
import type { ChatIntent } from "../types";

const SYSTEM_PROMPT = `Eres AniChat, un asistente conversacional experto en anime.

Tienes dos fuentes de conocimiento:
1. Una lista de resultados de búsqueda de AniList adjunta en el contexto (usada para mostrar tarjetas visuales).
2. Tu propio y vasto conocimiento interno sobre anime.

Reglas:
- Si el usuario hace preguntas sobre autores, estudios, creadores, OVAs, curiosidades o animes similares a uno específico, USA TU CONOCIMIENTO INTERNO para responderle detalladamente de forma útil y amigable.
- Para preguntas sobre el estado, temporada, emisión o episodios de un anime, responde con los datos de AniList del contexto (status RELEASING = en emisión, FINISHED = terminado, NOT_YET_RELEASED = por estrenar, HIATUS = en pausa) y cita las noticias recientes si las hay. Si el anime no aparece en los resultados, dilo y no afirmes un estado actual como hecho; aclara que tu conocimiento interno puede estar desactualizado.
- Si hay resultados de AniList en el contexto, puedes referirte a ellos (el usuario verá tarjetas visuales de esos resultados).
- NO limites tus respuestas solo a los resultados de AniList si la pregunta del usuario es más profunda o requiere datos como el nombre del autor, fechas exactas, OVAs, etc. Eres libre de usar tu conocimiento general.
- Adapta el tono de tu redacción al valor de "tone" que se te indique.
- No repitas la lista completa de datos de AniList en texto; asume que el usuario las está viendo visualmente.
- Si la intención es "news", responde SOLO con los titulares de "Noticias recientes" del contexto: resúmelos, menciona el medio y la fecha, e incluye el enlace en formato markdown. No inventes noticias ni detalles que no estén en los titulares. Si no hay titulares o fallaron, dilo con honestidad y no presentes conocimiento interno como noticia actual.
- Si el usuario busca recomendaciones parecidas a una obra, nombra las series que consideres similares usando tu conocimiento, y si coinciden con los resultados de AniList, mucho mejor.`;

export interface BuildReplyInput {
  message: string;
  history?: ModelMessage[];
  intent: ChatIntent;
  results: AnimeSearchResult;
  news?: NewsItem[];
  newsFailed?: boolean;
}

function formatResultsForContext(results: AnimeSearchResult): string {
  if (results.data.length === 0) return "Sin resultados.";

  return results.data
    .map((anime) => {
      const title = anime.title.english ?? anime.title.romaji;
      const genres = anime.genres.join(", ") || "sin géneros listados";
      const score = anime.averageScore != null ? `${anime.averageScore}/100` : "N/A";
      const start = anime.startDate?.year ?? "?";
      const end = anime.endDate?.year ?? "?";
      const season =
        anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "desconocida";
      return `- ${title} (${anime.seasonYear ?? "año desconocido"}) — estado AniList: ${anime.status ?? "desconocido"} — formato: ${anime.format ?? "?"} — episodios: ${anime.episodes ?? "?"} — temporada: ${season} — emisión: ${start}-${end} — score: ${score} — géneros: ${genres}`;
    })
    .join("\n");
}

function formatNewsForContext(news: NewsItem[], failed: boolean): string {
  if (failed) return "No se pudieron obtener noticias (fuente no disponible).";
  if (news.length === 0) return "Sin noticias recientes.";
  return news
    .map(
      (n) =>
        `- ${n.title} — ${n.source ?? "fuente desconocida"} (${n.publishedAt ?? "fecha desconocida"}) — ${n.link}`,
    )
    .join("\n");
}

export function buildReply({
  message,
  history = [],
  intent,
  results,
  news = [],
  newsFailed = false,
}: BuildReplyInput) {
  const context = `Intención detectada: ${intent.intent}
Tono solicitado: ${intent.tone}
Filtros: ${JSON.stringify(intent.filters)}

Resultados de AniList:
${formatResultsForContext(results)}${
    intent.intent === "news" || intent.intent === "detail"
      ? `\n\nNoticias recientes (Google News):\n${formatNewsForContext(news, newsFailed)}`
      : ""
  }`;

  return streamText({
    model: llmModel,
    maxOutputTokens: 768,
    providerOptions: llmProviderOptions,
    timeout: { totalMs: 12_000 },
    maxRetries: 0,
    system: `${SYSTEM_PROMPT}\n\nFecha actual: ${new Date().toLocaleDateString("es", { dateStyle: "long" })}. Tu conocimiento interno puede estar desactualizado; los datos de AniList y las noticias del contexto son más recientes y tienen prioridad.`,
    messages: [
      ...history,
      { role: "user", content: `${message}\n\n[Contexto interno]\n${context}` },
    ],
  });
}
