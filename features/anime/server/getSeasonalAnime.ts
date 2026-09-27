import { unstable_cache } from "next/cache";
import { anilistFetch } from "./anilistClient";
import { AnimeSearchResultSchema, type AnimeSearchResult } from "../schemas";

export interface SeasonalAnimeOptions {
  page?: number;
  limit?: number;
}

type AniListSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

// AniList define las temporadas así: invierno = ene-mar, primavera = abr-jun, etc.
const SEASON_BY_QUARTER: AniListSeason[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

function currentSeason(date = new Date()): { season: AniListSeason; year: number } {
  const season = SEASON_BY_QUARTER[Math.floor(date.getMonth() / 3)];
  return { season, year: date.getFullYear() };
}

const SEASONAL_ANIME_QUERY = /* GraphQL */ `
  query SeasonalAnime($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
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
        season: $season
        seasonYear: $seasonYear
        sort: [POPULARITY_DESC]
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
      }
    }
  }
`;

export const getSeasonalAnime = unstable_cache(
  async (options: SeasonalAnimeOptions = {}): Promise<AnimeSearchResult> => {
    const { season, year } = currentSeason();

    const raw = await anilistFetch<unknown>({
      query: SEASONAL_ANIME_QUERY,
      variables: {
        season,
        seasonYear: year,
        page: options.page ?? 1,
        perPage: options.limit ?? 10,
      },
    });

    return AnimeSearchResultSchema.parse(raw);
  },
  ["seasonal-anime"],
  { revalidate: 900 },
);
