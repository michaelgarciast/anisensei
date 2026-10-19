import "server-only";
import { generateText, Output, type ModelMessage } from "ai";
import { llmModel, llmProviderOptions } from "@/lib/llmClient";
import { ChatIntentSchema } from "../schemas";
import type { ChatIntent } from "../types";

function currentDateNote(): string {
  const now = new Date();
  const date = now.toLocaleDateString("es", { dateStyle: "long" });
  return `Fecha actual: ${date}. El año actual es ${now.getFullYear()}. Usa "year" solo si el usuario menciona un año o dice "este año" (en ese caso, ${now.getFullYear()}); nunca inventes un año.`;
}

const SYSTEM_PROMPT = `Eres el módulo de interpretación de intención de AniChat, un asistente conversacional de anime.

Tu ÚNICA responsabilidad es leer el mensaje del usuario (y el historial de la conversación) y devolver:
- "intent": qué quiere el usuario — "search" (busca anime por criterios o pide recomendaciones), "seasonal" (quiere novedades/temporada actual), "detail" (quiere tarjetas de info de un anime específico) "news" (quiere noticias o novedades ACTUALES del mundo del anime: anuncios, estrenos confirmados, lanzamientos, industria; pon en "similarTo" el anime o tema concreto si lo menciona), o "smalltalk" (charla casual, saludos, O PREGUNTAS DIRECTAS DE TRIVIA como el nombre del autor, si tiene OVAs, curiosidades, etc.).
- "filters": los criterios que puedas extraer (genre, tags, mood, similarTo, year, sort, format, minScore, maxEpisodes). Deja un campo sin definir si no aplica.
  IMPORTANTE: si el usuario pide animes "similares a X", puedes deducir el género de X y ponerlo en "genre" para ayudar en la búsqueda de la API. Usa los nombres canónicos en INGLÉS: Action, Adventure, Avant Garde, Award Winning, Boys Love, Comedy, Drama, Fantasy, Girls Love, Gourmet, Horror, Mystery, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Suspense.
  "tags": hasta 3 tags canónicos de AniList en INGLÉS que reflejen el mood o temática pedida (p. ej. "Time Travel", "Iyashikei", "Psychological", "Isekai", "School", "Military", "Found Family"). Úsalos solo si el usuario pide una temática o ambiente concreto; no los inventes.
  "sort": "trending" si pide lo que está de moda, "score" si pide los mejor valorados, "popularity" por defecto. "format": TV, MOVIE, OVA, ONA o SPECIAL solo si lo pide (p. ej. "una película"). "minScore": puntaje mínimo de 1 a 100 (p. ej. "bien valorado" = 75). "maxEpisodes": tope de episodios si pide algo corto (p. ej. "corto" = 13). Omite los que no apliquen.
- "tone": el tono con el que debería responder el asistente ("casual", "hype" o "informative"), según cómo escribe el usuario.

Reglas estrictas:
- Solo interpretas intención y tono; no redactas la respuesta final para el usuario.
- Si el usuario pregunta por el ESTADO ACTUAL de un anime concreto (en qué temporada está, si sigue en emisión, si ya terminó, cuántos episodios tiene, si hay nueva temporada, cuándo sale), clasifícalo como "detail" y pon el título del anime en "similarTo". En ese caso deja "genre", "mood" y "year" sin definir (solo "similarTo"). Estos datos cambian con el tiempo, así que NUNCA los clasifiques como "smalltalk".
- PARA OPTIMIZAR LA VELOCIDAD: Si la pregunta es solo sobre el autor, cuántas OVAs tiene, creadores o curiosidades de una serie que no requieren traer una lista de resultados visuales, clasifícalo como "smalltalk". De esa forma el asistente responderá instantáneamente con su conocimiento interno sin hacer llamadas lentas a la base de datos. Solo usa "search" o "detail" si el usuario necesita ver tarjetas visuales de animes.`;

export interface InterpretIntentInput {
  message: string;
  history?: ModelMessage[];
}

export async function interpretIntent({
  message,
  history = [],
}: InterpretIntentInput): Promise<ChatIntent> {
  const { output } = await generateText({
    model: llmModel,
    maxOutputTokens: 512,
    providerOptions: llmProviderOptions,
    timeout: 8_000,
    maxRetries: 0,
    output: Output.object({ schema: ChatIntentSchema }),
    system: `${SYSTEM_PROMPT}\n\n${currentDateNote()}`,
    messages: [...history, { role: "user", content: message }],
  });

  return output;
}
