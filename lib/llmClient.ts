import "server-only";
import { google } from "@ai-sdk/google";

// Usar siempre desde código de servidor (Route Handlers, Server Components, etc.).
export const llmModel = google("gemini-3.1-flash-lite");
