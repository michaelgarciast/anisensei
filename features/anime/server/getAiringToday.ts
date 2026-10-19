import { unstable_cache } from "next/cache";
import { anilistFetch } from "./anilistClient";
import type { AnimeSearchResult } from "../schemas";
import { toAiringTodayResult } from "./parseAiringToday";

const AIRING_TODAY_QUERY = /* GraphQL */ `
  query AiringToday($from: Int, $to: Int, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
        episode
        airingAt
        media {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          description(asHtml: false)
          type
          format
          status
          episodes
          duration
          season
          seasonYear
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          averageScore
          genres
          trailer {
            id
            site
            thumbnail
          }
          isAdult
        }
      }
    }
  }
`;

export const getAiringToday = unstable_cache(
  async (options: { limit?: number } = {}): Promise<AnimeSearchResult> => {
    const from = Math.floor(Date.now() / 1000);
    const raw = await anilistFetch<unknown>({
      query: AIRING_TODAY_QUERY,
      variables: { from, to: from + 24 * 3600, perPage: 50 },
    });
    return toAiringTodayResult(raw, options.limit ?? 6);
  },
  ["airing-today"],
  { revalidate: 900 },
);
