import { expect, test } from "bun:test";
import { AnimeDetailResponseSchema } from "./schemas";

const recommendation = (id: number, type = "ANIME", isAdult = false) => ({
  mediaRecommendation: {
    id,
    type,
    isAdult,
    title: { romaji: `Serie ${id}`, english: null, native: null },
    coverImage: { extraLarge: null, large: null, medium: null },
    averageScore: 75,
    genres: ["Action"],
  },
});

const media = {
  id: 1,
  idMal: null,
  title: { romaji: "Original", english: null, native: null },
  coverImage: { extraLarge: null, large: null, medium: null },
  bannerImage: null,
  description: null,
  type: "ANIME",
  format: null,
  status: null,
  episodes: null,
  duration: null,
  season: null,
  seasonYear: null,
  startDate: null,
  endDate: null,
  averageScore: null,
  genres: [],
  trailer: null,
  characters: { edges: [] },
};

test("retains only unique, non-adult anime recommendations other than the current anime", () => {
  const result = AnimeDetailResponseSchema.parse({
    Media: {
      ...media,
      recommendations: {
        nodes: [
          null,
          { mediaRecommendation: null },
          recommendation(2),
          recommendation(1),
          recommendation(3, "MANGA"),
          recommendation(4, "ANIME", true),
          recommendation(2),
          recommendation(5),
        ],
      },
    },
  });
  expect(result.recommendations.map(({ id }) => id)).toEqual([2, 5]);
  expect(result.characters).toEqual([]);
});

test("handles missing recommendations from AniList", () => {
  const result = AnimeDetailResponseSchema.parse({ Media: { ...media, recommendations: null } });
  expect(result.recommendations).toEqual([]);
});
