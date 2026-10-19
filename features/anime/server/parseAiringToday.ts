import { z } from "zod";
import { AnimeSchema, type Anime, type AnimeSearchResult } from "../schemas";

const AiringTodayResponseSchema = z.object({
  Page: z.object({
    airingSchedules: z.array(
      z.object({
        episode: z.number(),
        airingAt: z.number(),
        media: AnimeSchema.extend({ isAdult: z.boolean().nullable() }).nullable(),
      }),
    ),
  }),
});

export function toAiringTodayResult(raw: unknown, limit: number): AnimeSearchResult {
  const seen = new Set<number>();
  const data: Anime[] = [];
  for (const { episode, airingAt, media } of AiringTodayResponseSchema.parse(raw).Page
    .airingSchedules) {
    if (!media || media.type !== "ANIME" || seen.has(media.id)) continue;
    const { isAdult, ...anime } = media;
    if (isAdult !== false) continue;
    seen.add(media.id);
    data.push({ ...anime, nextAiringEpisode: { episode, airingAt } });
  }
  const shown = data.slice(0, limit);
  return {
    data: shown,
    pagination: { last_page: 1, has_next_page: false, total: data.length, current_page: 1 },
  };
}
