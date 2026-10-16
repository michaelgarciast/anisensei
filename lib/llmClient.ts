import "server-only";
import { google } from "@ai-sdk/google";

// Usar siempre desde código de servidor (Route Handlers, Server Components, etc.).
export const llmModel = google("gemini-2.5-flash");
