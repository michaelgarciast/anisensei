import { unstable_cache } from "next/cache";
import { anilistFetch } from "./anilistClient";
import { AnimeSearchResultSchema, type AnimeSearchResult } from "../schemas";

export interface SearchAnimeFilters {
  query?: string;
  /** Nombre de género de AniList en inglés, p. ej. "Action", "Romance" */
  genre?: string;
  year?: number;
  /** Nombres de tags de AniList en inglés, p. ej. "Time Travel", "Iyashikei" */
  tags?: string[];
  /** Prioriza la coincidencia con el texto (p. ej. al resolver un anime concreto). */
  sortByMatch?: boolean;
  sort?: "trending" | "score" | "popularity";
  format?: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
  /** Puntaje mínimo en escala 0-100 de AniList. */
  minScore?: number;
  maxEpisodes?: number;
  status?: "airing" | "complete" | "upcoming";
  page?: number;
  limit?: number;
}

const ANILIST_SORT: Record<NonNullable<SearchAnimeFilters["sort"]>, string> = {
  trending: "TRENDING_DESC",
  score: "SCORE_DESC",
  popularity: "POPULARITY_DESC",
};

const ANILIST_STATUS: Record<NonNullable<SearchAnimeFilters["status"]>, string> = {
  airing: "RELEASING",
  complete: "FINISHED",
  upcoming: "NOT_YET_RELEASED",
};

const SEARCH_ANIME_QUERY = /* GraphQL */ `
  query SearchAnime(
    $search: String
    $genre: String
    $tags: [String]
    $sort: [MediaSort]
    $format: MediaFormat
    $minScore: Int
    $maxEpisodes: Int
    $seasonYear: Int
    $status: MediaStatus
    $page: Int
    $perPage: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: ANIME
        search: $search
        genre: $genre
        tag_in: $tags
        format: $format
        averageScore_greater: $minScore
        episodes_lesser: $maxEpisodes
        seasonYear: $seasonYear
        status: $status
        sort: $sort
        isAdult: false
      ) {
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
        meanScore
        popularity
        favourites
        genres
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
        trailer {
          id
          site
          thumbnail
        }
        nextAiringEpisode {
          episode
          airingAt
        }
      }
    }
  }
`;

export const searchAnime = unstable_cache(
  async (filters: SearchAnimeFilters = {}): Promise<AnimeSearchResult> => {
    const raw = await anilistFetch<unknown>({
      query: SEARCH_ANIME_QUERY,
      variables: {
        search: filters.query,
        genre: filters.genre,
        tags: filters.tags?.length ? filters.tags : undefined,
        sort: [
          filters.sortByMatch && filters.query
            ? "SEARCH_MATCH"
            : ANILIST_SORT[filters.sort ?? "popularity"],
        ],
        format: filters.format,
        minScore: filters.minScore,
        maxEpisodes: filters.maxEpisodes ? filters.maxEpisodes + 1 : undefined,
        seasonYear: filters.year,
        status: filters.status ? ANILIST_STATUS[filters.status] : undefined,
        page: filters.page ?? 1,
        perPage: filters.limit ?? 10,
      },
    });

    return AnimeSearchResultSchema.parse(raw);
  },
  ["search-anime"],
  { revalidate: 900 },
);
