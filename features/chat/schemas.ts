import { z } from "zod";

export const ChatIntentSchema = z.object({
  intent: z.enum(["search", "seasonal", "detail", "smalltalk"]),
  filters: z.object({
    genre: z.string().optional(),
    mood: z.string().optional(),
    similarTo: z.string().optional(),
    year: z.number().optional(),
  }),
  tone: z.enum(["casual", "hype", "informative"]),
});

export type ChatIntentOutput = z.infer<typeof ChatIntentSchema>;

export const MAX_CHAT_MESSAGE_LENGTH = 2000;
export const MAX_CHAT_MESSAGES = 9;
export const MAX_CHAT_BODY_BYTES = 64_000;

export const ChatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          parts: z
            .array(
              z.object({
                type: z.literal("text"),
                text: z.string().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
              }),
            )
            .min(1)
            .max(4),
        }),
      )
      .min(1)
      .max(MAX_CHAT_MESSAGES),
  })
  .refine(
    ({ messages }) =>
      messages.at(-1)?.role === "user" &&
      messages.at(-1)?.parts.some((part) => part.text.trim().length > 0) &&
      messages.every(
        (item) =>
          item.parts.reduce((n, part) => n + part.text.length, 0) <= MAX_CHAT_MESSAGE_LENGTH,
      ) &&
      messages.reduce(
        (total, item) => total + item.parts.reduce((n, part) => n + part.text.length, 0),
        0,
      ) <= 14_000,
  );
