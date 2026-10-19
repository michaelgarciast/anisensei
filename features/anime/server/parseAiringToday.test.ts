import { describe, expect, test } from "bun:test";
import { toAiringTodayResult } from "./parseAiringToday";

const media = (id: number, overrides: object = {}) => ({
  id,
  idMal: null,
  title: { romaji: `Serie ${id}`, english: null, native: null },
  coverImage: { extraLarge: null, large: null, medium: null },
  bannerImage: null,
  description: null,
  type: "ANIME",
  format: null,
  status: "RELEASING",
  episodes: null,
  duration: null,
  season: null,
  seasonYear: null,
  startDate: null,
  endDate: null,
  averageScore: 80,
  genres: [],
  trailer: null,
  isAdult: false,
  ...overrides,
});

describe("toAiringTodayResult", () => {
  test("keeps unique non-adult anime and attaches the airing episode", async () => {
    const raw = {
      Page: {
        airingSchedules: [
          { episode: 3, airingAt: 100, media: media(1) },
          { episode: 4, airingAt: 200, media: media(1) },
          { episode: 1, airingAt: 300, media: media(2, { isAdult: true }) },
          { episode: 1, airingAt: 400, media: media(3, { type: "MANGA" }) },
          { episode: 9, airingAt: 500, media: null },
          { episode: 2, airingAt: 600, media: media(4) },
        ],
      },
    };
    const result = toAiringTodayResult(raw, 6);
    expect(result.data.map(({ id }) => id)).toEqual([1, 4]);
    expect(result.data[0].nextAiringEpisode).toEqual({ episode: 3, airingAt: 100 });
    expect(toAiringTodayResult(raw, 1).data).toHaveLength(1);
  });
});
