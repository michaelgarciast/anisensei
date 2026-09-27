import Image from "next/image";
import { CalendarDays, Clapperboard, Star, Tv } from "lucide-react";
import {
  animeTrailerEmbedUrl,
  formatAnimeFormat,
  formatAnimeStatus,
  mainStudioName,
  type AnimeDetail as AnimeDetailData,
} from "../schemas";
import { AnimeCard } from "./AnimeCard";
import { CharacterList } from "./CharacterList";

interface AnimeDetailProps {
  readonly anime: AnimeDetailData;
}

function formatDate(date: AnimeDetailData["startDate"]): string | null {
  if (!date?.year) return null;
  const parts = [date.day, date.month, date.year].filter((p) => p != null);
  return parts.join("/");
}

function scoreText(anime: AnimeDetailData): string {
  if (anime.averageScore == null) return "Sin puntaje";
  const base = (anime.averageScore / 10).toFixed(1);
  return anime.favourites != null
    ? `${base} · ${new Intl.NumberFormat("es").format(anime.favourites)} favoritos`
    : base;
}

export function AnimeDetail({ anime }: AnimeDetailProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const poster = anime.coverImage.extraLarge ?? anime.coverImage.large ?? null;
  const studio = mainStudioName(anime);
  const start = formatDate(anime.startDate);
  const end = formatDate(anime.endDate);
  let airedLabel = "Fecha desconocida";
  if (start) airedLabel = end ? `${start} — ${end}` : start;
  const typeLabel = [
    formatAnimeFormat(anime.format),
    anime.episodes ? `${anime.episodes} ep.` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const trailerUrl = animeTrailerEmbedUrl(anime);

  const meta: { icon: typeof Tv; label: string }[] = [
    { icon: Tv, label: typeLabel || "Tipo desconocido" },
    { icon: CalendarDays, label: airedLabel },
    { icon: Clapperboard, label: formatAnimeStatus(anime.status) },
  ];
  if (studio) meta.push({ icon: Tv, label: `Estudio: ${studio}` });

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-xl border bg-muted sm:w-56">
          {poster ? (
            <Image
              src={poster}
              alt={`Póster de ${title}`}
              fill
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            {anime.title.romaji !== title && (
              <p className="text-sm text-muted-foreground">{anime.title.romaji}</p>
            )}
            {anime.title.native && (
              <p className="text-sm text-muted-foreground">{anime.title.native}</p>
            )}
          </header>

          <div className="flex items-center gap-1.5 text-sm font-medium" aria-label="Puntaje">
            <Star className="size-4 fill-yellow-400 text-yellow-400" aria-hidden />
            {scoreText(anime)}
          </div>

          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {meta.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          {anime.genres.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Géneros">
              {anime.genres.map((genre) => (
                <li
                  key={genre}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {genre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {anime.description && (
        <section aria-labelledby="synopsis-heading" className="space-y-2">
          <h2 id="synopsis-heading" className="text-lg font-semibold">
            Sinopsis
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {anime.description}
          </p>
        </section>
      )}

      {trailerUrl && (
        <section aria-labelledby="trailer-heading" className="space-y-2">
          <h2 id="trailer-heading" className="text-lg font-semibold">
            Trailer
          </h2>
          <div className="aspect-video w-full overflow-hidden rounded-xl border">
            <iframe
              src={trailerUrl}
              title={`Trailer de ${title}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      )}

      <CharacterList characters={anime.characters} />

      <section aria-labelledby="similar-heading" className="space-y-3">
        <h2 id="similar-heading" className="text-lg font-semibold">
          Series similares
        </h2>
        {anime.recommendations.length > 0 ? (
          <ul className="flex gap-3 overflow-x-auto pb-3">
            {anime.recommendations.map((recommendation) => (
              <li key={recommendation.id} className="shrink-0">
                <AnimeCard anime={recommendation} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no hay series similares disponibles.</p>
        )}
      </section>
    </article>
  );
}
