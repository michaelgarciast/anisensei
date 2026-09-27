import { z } from "zod";

const FuzzyDateSchema = z.object({
  year: z.number().nullable(),
  month: z.number().nullable(),
  day: z.number().nullable(),
});

const ImageSchema = z.object({
  extraLarge: z.string().nullable().optional(),
  large: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

const CharacterNameSchema = z.object({
  full: z.string(),
  native: z.string().nullable().optional(),
});

const VoiceActorSchema = z.object({
  id: z.number(),
  name: CharacterNameSchema,
  image: z.object({ medium: z.string().nullable() }).partial().nullable().optional(),
  language: z.string(),
});

const CharacterNodeSchema = z.object({
  id: z.number(),
  name: CharacterNameSchema,
  image: z.object({ large: z.string().nullable(), medium: z.string().nullable() }),
});

const CharacterEdgeSchema = z.object({
  role: z.enum(["MAIN", "SUPPORTING", "BACKGROUND"]),
  node: CharacterNodeSchema,
  voiceActors: z.array(VoiceActorSchema),
  voiceActorRoles: z
    .array(
      z.object({
        voiceActor: VoiceActorSchema.nullable(),
        notes: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export const AnimeCharacterEntrySchema = z.object({
  role: z.enum(["MAIN", "SUPPORTING", "BACKGROUND"]),
  character: CharacterNodeSchema,
  voiceActors: z.array(VoiceActorSchema),
});

export type AnimeCharacterEntry = z.infer<typeof AnimeCharacterEntrySchema>;

const StudioSchema = z.object({ id: z.number(), name: z.string() });

export const AnimeSchema = z.object({
  /** ID de AniList (propiedad del proveedor). */
  id: z.number(),
  /** ID equivalente en MyAnimeList, útil para enlaces externos. */
  idMal: z.number().nullable(),
  title: z.object({
    romaji: z.string(),
    english: z.string().nullable(),
    native: z.string().nullable(),
  }),
  coverImage: ImageSchema,
  bannerImage: z.string().nullable(),
  description: z.string().nullable(),
  type: z.string().nullable(),
  format: z.string().nullable(),
  status: z.string().nullable(),
  episodes: z.number().nullable(),
  duration: z.number().nullable(),
  season: z.string().nullable(),
  seasonYear: z.number().nullable(),
  startDate: FuzzyDateSchema.nullable(),
  endDate: FuzzyDateSchema.nullable(),
  /** Puntaje en escala 0-100 propio de AniList. */
  averageScore: z.number().nullable(),
  meanScore: z.number().nullable().optional(),
  popularity: z.number().nullable().optional(),
  favourites: z.number().nullable().optional(),
  genres: z.array(z.string()),
  studios: z.object({ nodes: z.array(StudioSchema) }).optional(),
  trailer: z
    .object({ id: z.string(), site: z.string(), thumbnail: z.string().nullable() })
    .nullable(),
});

export type Anime = z.infer<typeof AnimeSchema>;

const PageInfoSchema = z.object({
  total: z.number(),
  currentPage: z.number(),
  lastPage: z.number(),
  hasNextPage: z.boolean(),
  perPage: z.number(),
});

const MediaConnectionSchema = z.object({
  media: z.array(AnimeSchema.nullable()),
  pageInfo: PageInfoSchema,
});

export const AnimeSearchResultSchema = z
  .object({ Page: MediaConnectionSchema })
  .transform(({ Page }) => ({
    data: Page.media.filter((m): m is Anime => m != null),
    pagination: {
      last_page: Page.pageInfo.lastPage,
      has_next_page: Page.pageInfo.hasNextPage,
      total: Page.pageInfo.total,
      current_page: Page.pageInfo.currentPage,
    },
  }));

export type AnimeSearchResult = z.infer<typeof AnimeSearchResultSchema>;

const CharactersConnectionSchema = z.object({
  edges: z.array(CharacterEdgeSchema),
});

const AnimeRecommendationSchema = AnimeSchema.pick({
  id: true,
  title: true,
  coverImage: true,
  averageScore: true,
  genres: true,
}).extend({ type: z.string().nullable(), isAdult: z.boolean().nullable() });

const RecommendationsConnectionSchema = z.object({
  nodes: z.array(
    z.object({ mediaRecommendation: AnimeRecommendationSchema.nullable() }).nullable(),
  ),
});

export const AnimeDetailMediaSchema = AnimeSchema.extend({
  characters: CharactersConnectionSchema,
  recommendations: RecommendationsConnectionSchema.nullable(),
});

export const AnimeDetailResponseSchema = z
  .object({ Media: AnimeDetailMediaSchema })
  .transform(({ Media }) => {
    const {
      characters: connection,
      recommendations: recommendationConnection,
      ...animeFields
    } = Media;
    const characters: AnimeCharacterEntry[] = connection.edges.map((edge) => ({
      role: edge.role,
      character: edge.node,
      voiceActors: edge.voiceActors,
    }));
    const seen = new Set<number>();
    const recommendations =
      recommendationConnection?.nodes
        .flatMap((node) => {
          const anime = node?.mediaRecommendation;
          if (
            anime?.type !== "ANIME" ||
            anime.isAdult !== false ||
            anime.id === Media.id ||
            seen.has(anime.id)
          )
            return [];
          seen.add(anime.id);
          return [anime];
        })
        .slice(0, 6) ?? [];
    return { ...animeFields, characters, recommendations };
  });

export type AnimeDetail = z.infer<typeof AnimeDetailResponseSchema>;

/** Genera la URL embebible de YouTube a partir del trailer de AniList (site === "youtube"). */
export function animeTrailerEmbedUrl(anime: Pick<Anime, "trailer">): string | null {
  const trailer = anime.trailer;
  if (trailer?.site !== "youtube") return null;
  return `https://www.youtube.com/embed/${trailer.id}`;
}

/** Nombre del estudio principal de animación. */
export function mainStudioName(anime: Anime): string | null {
  return anime.studios?.nodes[0]?.name ?? null;
}

/** Formatea "status" de AniList (enum) a texto en español legible. */
export function formatAnimeStatus(status: string | null): string {
  const map: Record<string, string> = {
    FINISHED: "Finalizado",
    RELEASING: "En emisión",
    NOT_YET_RELEASED: "Próximamente",
    CANCELLED: "Cancelado",
    HIATUS: "En pausa",
  };
  return status ? (map[status] ?? status) : "Estado desconocido";
}

/** Etiqueta corta del "format" de AniList en español. */
export function formatAnimeFormat(format: string | null): string {
  const map: Record<string, string> = {
    TV: "Serie TV",
    TV_SHORT: "Serie corta",
    MOVIE: "Película",
    SPECIAL: "Especial",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Música",
    MANGA: "Manga",
    NOVEL: "Novela",
    ONE_SHOT: "One shot",
  };
  return format ? (map[format] ?? format) : "Formato desconocido";
}
