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
  status?: "airing" | "complete" | "upcoming";
  page?: number;
  limit?: number;
}

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
        sort: filters.sortByMatch && filters.query ? ["SEARCH_MATCH"] : ["POPULARITY_DESC"],
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
