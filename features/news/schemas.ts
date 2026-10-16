import { z } from "zod";

export const NewsItemSchema = z.object({
  title: z.string().min(1),
  link: z.url(),
  source: z.string().optional(),
  publishedAt: z.string().optional(),
});

export const NewsItemsSchema = z.array(NewsItemSchema);

export type NewsItem = z.infer<typeof NewsItemSchema>;
