import Image from "next/image";
import { CalendarDays, Clapperboard, Heart, Play, Star } from "lucide-react";
import {
  animeTrailerEmbedUrl,
  externalLinkUrl,
  cleanAnimeDescription,
  formatAnimeFormat,
  formatAnimeStatus,
  mainStudioName,
  type AnimeDetail as AnimeDetailData,
} from "../schemas";
import { AnimeCard } from "./AnimeCard";
import { BackButton } from "./BackButton";
import { CharacterList } from "./CharacterList";
import { DetailSection } from "./DetailSection";
import { TrailerPlayer } from "./TrailerPlayer";

interface AnimeDetailProps {
  readonly anime: AnimeDetailData;
}

function formatDate(date: AnimeDetailData["startDate"]): string | null {
  if (!date?.year) return null;
  const parts = [date.day, date.month, date.year].filter((p) => p != null);
  return parts.join("/");
}

function formatSeason(season: string | null, year: number | null): string | null {
  const map: Record<string, string> = {
    WINTER: "Invierno",
    SPRING: "Primavera",
    SUMMER: "Verano",
    FALL: "Otoño",
  };
  const label = season ? (map[season] ?? season) : null;
  if (label && year) return `${label} ${year}`;
  return label ?? (year != null ? String(year) : null);
}

export function AnimeDetail({ anime }: AnimeDetailProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const poster = anime.coverImage.extraLarge ?? anime.coverImage.large ?? null;
  const banner = anime.bannerImage;
  const coverColor = anime.coverImage.color ?? null;
  const studio = mainStudioName(anime);
  const start = formatDate(anime.startDate);
  const end = formatDate(anime.endDate);
  const season = formatSeason(anime.season, anime.seasonYear);
  const trailerUrl = animeTrailerEmbedUrl(anime);
  const crunchyrollUrl = externalLinkUrl(anime, "Crunchyroll");
  const score = anime.averageScore;

  const infoRows: { label: string; value: string }[] = [
    { label: "Formato", value: formatAnimeFormat(anime.format) },
    {
      label: "Episodios",
      value: anime.episodes != null ? String(anime.episodes) : "Por anunciar",
    },
    {
      label: "Duración",
      value: anime.duration != null ? `${anime.duration} min. por capítulo` : "Desconocida",
    },
    { label: "Estado", value: formatAnimeStatus(anime.status) },
    { label: "Estreno", value: start ?? "Desconocido" },
    { label: "Finalización", value: end ?? "Desconocida" },
    { label: "Temporada", value: season ?? "Desconocida" },
    { label: "Estudio", value: studio ?? "Desconocido" },
  ];

  return (
    <article className="flex w-full flex-col items-center">
      {/* Banner a lo ancho, como en plataformas de streaming */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-72">
        {(banner ?? poster) ? (
          <Image
            src={(banner ?? poster) as string}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className={banner ? "object-cover" : "scale-125 object-cover blur-2xl"}
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-linear-to-br from-primary/25 via-background to-accent"
            style={coverColor ? { backgroundColor: coverColor } : undefined}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-black/30"
        />
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4">
        {/* Póster flotando sobre el banner con título y métricas */}
        <header className="relative -mt-24 flex flex-col items-center gap-4 sm:-mt-24 sm:flex-row sm:items-end sm:gap-7">
          <div className="relative aspect-2/3 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-foreground bg-muted shadow-[5px_5px_0_0_var(--foreground)] sm:w-44">
            {poster ? (
              <Image
                src={poster}
                alt={`Póster de ${title}`}
                fill
                priority
                sizes="(max-width: 640px) 144px, 176px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 pb-1 text-center sm:text-left">
            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-bold uppercase leading-tight tracking-wide sm:text-4xl">
                {title}
              </h1>
              {anime.title.romaji !== title && (
                <p className="text-sm text-muted-foreground">{anime.title.romaji}</p>
              )}
              {anime.title.native && (
                <p className="text-sm text-muted-foreground">{anime.title.native}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {score != null && (
                <span className="flex items-center gap-1.5 rounded-lg border-2 border-foreground bg-amber-400 px-2.5 py-1 text-sm font-bold text-black shadow-[2px_2px_0_0_var(--foreground)]">
                  <Star className="size-4 fill-black text-black" aria-hidden />
                  {(score / 10).toFixed(1)}
                </span>
              )}
              {anime.favourites != null && (
                <span className="flex items-center gap-1.5 rounded-lg border border-foreground/15 bg-card px-2.5 py-1 text-sm text-muted-foreground">
                  <Heart className="size-4 text-rose-500" aria-hidden />
                  {new Intl.NumberFormat("es").format(anime.favourites)} favoritos
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-lg border border-foreground/15 bg-card px-2.5 py-1 text-sm text-muted-foreground">
                <Clapperboard className="size-4 text-primary" aria-hidden />
                {formatAnimeFormat(anime.format)}
              </span>
              {season && (
                <span className="flex items-center gap-1.5 rounded-lg border border-foreground/15 bg-card px-2.5 py-1 text-sm text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  {season}
                </span>
              )}
            </div>

            {crunchyrollUrl && (
              <div className="flex justify-center sm:justify-start">
                <a
                  href={crunchyrollUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-foreground bg-[#f47521] px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-0 active:shadow-none"
                >
                  <Play className="size-4 fill-black" aria-hidden />
                  Ver en Crunchyroll
                </a>
              </div>
            )}

            {anime.genres.length > 0 && (
              <ul
                className="flex flex-wrap justify-center gap-1.5 sm:justify-start"
                aria-label="Géneros"
              >
                {anime.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-md border border-primary/50 bg-primary/10 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-primary"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {/* Cuerpo: contenido principal + barra lateral de información */}
        <div className="grid gap-6 pb-10 pt-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="flex min-w-0 flex-col gap-6">
            {anime.description && (
              <DetailSection id="synopsis-heading" title="Sinopsis">
                <p className="whitespace-pre-line text-[15px] leading-7 text-muted-foreground">
                  {cleanAnimeDescription(anime.description)}
                </p>
              </DetailSection>
            )}

            <CharacterList characters={anime.characters} />

            {trailerUrl && (
              <DetailSection id="trailer-heading" title="Trailer">
                <TrailerPlayer
                  embedUrl={trailerUrl}
                  thumbnail={anime.trailer?.thumbnail ?? null}
                  title={`Trailer de ${title}`}
                />
              </DetailSection>
            )}
          </div>

          <aside className="lg:self-start">
            <DetailSection id="info-heading" title="Información">
              {score != null && (
                <div className="space-y-1.5">
                  <p className="flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-bold">
                      {(score / 10).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 10</span>
                  </p>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={`Puntaje ${(score / 10).toFixed(1)} de 10`}
                  >
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )}
              <dl className="divide-y divide-border/60">
                {infoRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 py-2 text-sm"
                  >
                    <dt className="shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 truncate text-right font-medium" title={value}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </DetailSection>
          </aside>

          <div className="lg:col-span-2">
            <DetailSection id="similar-heading" title="Series similares">
              {anime.recommendations.length > 0 ? (
                <ul className="grid list-none grid-cols-[repeat(auto-fill,10rem)] auto-rows-fr justify-center gap-3 sm:justify-start">
                  {anime.recommendations.map((recommendation) => (
                    <li key={recommendation.id}>
                      <AnimeCard anime={recommendation} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay series similares disponibles.
                </p>
              )}
            </DetailSection>
          </div>
        </div>
      </div>
    </article>
  );
}
