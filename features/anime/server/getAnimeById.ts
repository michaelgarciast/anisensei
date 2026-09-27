import { unstable_cache } from "next/cache";
import { anilistFetch } from "./anilistClient";
import { AnimeDetailResponseSchema, type AnimeDetail } from "../schemas";

const ANIME_DETAIL_QUERY = /* GraphQL */ `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
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
      recommendations(sort: RATING_DESC, perPage: 8) {
        nodes {
          mediaRecommendation {
            id
            type
            isAdult
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
            averageScore
            genres
          }
        }
      }
      characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
        edges {
          role
          node {
            id
            name {
              full
              native
            }
            image {
              large
              medium
            }
          }
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
            id
            name {
              full
              native
            }
            image {
              medium
            }
            language
          }
        }
      }
    }
  }
`;

export const getAnimeById = unstable_cache(
  async (id: number): Promise<AnimeDetail> => {
    const raw = await anilistFetch<unknown>({
      query: ANIME_DETAIL_QUERY,
      variables: { id },
    });

    return AnimeDetailResponseSchema.parse(raw);
  },
  ["anime-detail-with-recommendations"],
  { revalidate: 3600 },
);
