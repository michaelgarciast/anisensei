import type { UIMessage } from "ai";
import type { Anime } from "@/features/anime/schemas";
import type { ChatIntentOutput } from "./schemas";

// El schema de Zod en `schemas.ts` es la fuente de verdad del contrato; estos
// tipos derivados se reexportan para consumo del resto de la feature.
export type ChatIntent = ChatIntentOutput;
export type ChatIntentKind = ChatIntent["intent"];
export type ChatIntentFilters = ChatIntent["filters"];
export type ChatTone = ChatIntent["tone"];

// Mensaje de UI del chat tal como lo maneja `useChat` (AI SDK): partes de texto
// más el data part `anime-results` que el route handler escribe antes de la
// respuesta en streaming. El tipo garantiza que `part.data` es `Anime[]`.
export type ChatUIMessage = UIMessage<unknown, { "anime-results": Anime[] }>;
