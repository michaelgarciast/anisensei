import "server-only";
import { generateText, Output, type ModelMessage } from "ai";
import { llmModel } from "@/lib/llmClient";
import { ChatIntentSchema } from "../schemas";
import type { ChatIntent } from "../types";

const SYSTEM_PROMPT = `Eres el módulo de interpretación de intención de AniChat, un asistente conversacional de anime.

Tu ÚNICA responsabilidad es leer el mensaje del usuario (y el historial de la conversación) y devolver:
- "intent": qué quiere el usuario — "search" (busca anime por criterios o pide recomendaciones), "seasonal" (quiere novedades/temporada actual), "detail" (quiere tarjetas de info de un anime específico) o "smalltalk" (charla casual, saludos, O PREGUNTAS DIRECTAS DE TRIVIA como el nombre del autor, si tiene OVAs, curiosidades, etc.).
- "filters": los criterios que puedas extraer (genre, mood, similarTo, year). Deja un campo sin definir si no aplica.
  IMPORTANTE: si el usuario pide animes "similares a X", puedes deducir el género de X y ponerlo en "genre" para ayudar en la búsqueda de la API. Usa los nombres canónicos en INGLÉS: Action, Adventure, Avant Garde, Award Winning, Boys Love, Comedy, Drama, Fantasy, Girls Love, Gourmet, Horror, Mystery, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Suspense.
- "tone": el tono con el que debería responder el asistente ("casual", "hype" o "informative"), según cómo escribe el usuario.

Reglas estrictas:
- Solo interpretas intención y tono; no redactas la respuesta final para el usuario.
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
    maxOutputTokens: 256,
    timeout: 8_000,
    output: Output.object({ schema: ChatIntentSchema }),
    system: SYSTEM_PROMPT,
    messages: [...history, { role: "user", content: message }],
  });

  return output;
}
