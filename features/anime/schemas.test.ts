import { expect, test } from "bun:test";
import {
  AnimeDetailResponseSchema,
  cleanAnimeDescription,
  externalLinkUrl,
  formatNextEpisode,
} from "./schemas";

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

test("cleanAnimeDescription elimina etiquetas HTML y decodifica entidades", () => {
  expect(cleanAnimeDescription("Hola <i>mundo</i>.<br><br>Fin &amp; adiós<br/>")).toBe(
    "Hola mundo.\n\nFin & adiós",
  );
});

test("externalLinkUrl devuelve la URL del servicio pedido y es insensible a mayúsculas", () => {
  const externalLinks = [
    { url: "https://www.crunchyroll.com/series/abc", site: "Crunchyroll" },
    { url: "https://example.com", site: "Official Site" },
  ];
  expect(externalLinkUrl({ externalLinks }, "crunchyroll")).toBe(
    "https://www.crunchyroll.com/series/abc",
  );
  expect(externalLinkUrl({ externalLinks }, "Netflix")).toBeNull();
  expect(externalLinkUrl({ externalLinks: null }, "Crunchyroll")).toBeNull();
});

test("retains only anime relations useful for watch order", () => {
  const edge = (id: number, relationType: string, type = "ANIME") => ({
    relationType,
    node: {
      id,
      type,
      format: "TV",
      status: "FINISHED",
      seasonYear: 2020,
      title: { romaji: `Serie ${id}`, english: null, native: null },
    },
  });
  const result = AnimeDetailResponseSchema.parse({
    Media: {
      ...media,
      recommendations: null,
      relations: {
        edges: [
          null,
          edge(2, "SEQUEL"),
          edge(3, "ADAPTATION", "MANGA"),
          edge(4, "CHARACTER"),
          edge(5, "PREQUEL"),
        ],
      },
    },
  });
  expect(result.relations.map(({ id }) => id)).toEqual([2, 5]);
});

test("formatNextEpisode muestra la cuenta regresiva en d/h/min", () => {
  const now = 1_000_000_000_000;
  const at = (seconds: number) => ({ episode: 5, airingAt: now / 1000 + seconds });
  expect(formatNextEpisode(null, now)).toBeNull();
  expect(formatNextEpisode(at(3 * 86400 + 2 * 3600), now)).toBe("Ep. 5 · en 3 d 2 h");
  expect(formatNextEpisode(at(2 * 3600 + 5 * 60), now)).toBe("Ep. 5 · en 2 h 5 min");
  expect(formatNextEpisode(at(-10), now)).toBe("Ep. 5 · en 0 min");
});

test("retains only key staff roles with a name", () => {
  const edge = (role: string | null, full: string | null) => ({ role, node: { name: { full } } });
  const result = AnimeDetailResponseSchema.parse({
    Media: {
      ...media,
      recommendations: null,
      staff: {
        edges: [
          null,
          edge("Director", "Ana"),
          edge("Key Animation", "Beto"),
          edge("Original Creator", "Caro"),
          edge("Music", null),
          { role: "Director", node: null },
        ],
      },
    },
  });
  expect(result.staff).toEqual([
    { role: "Director", name: "Ana" },
    { role: "Original Creator", name: "Caro" },
  ]);
});
