import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Anime } from "../schemas";

interface AnimeCardProps {
  readonly anime: Pick<Anime, "id" | "title" | "coverImage" | "averageScore" | "genres">;
  /** true si la tarjeta aparece above the fold (p. ej. primeras del chat): carga ansiosa para el LCP. */
  readonly priority?: boolean;
}

// AniList puntúa de 0 a 100; lo mostramos en escala de 10 como antes.
function scoreOn10(averageScore: number | null): string | null {
  return averageScore != null ? (averageScore / 10).toFixed(1) : null;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const poster = anime.coverImage.extraLarge ?? anime.coverImage.large ?? null;
  const score = scoreOn10(anime.averageScore);
  const genres = anime.genres.slice(0, 2);

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group flex h-full w-40 shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-foreground/15 bg-card text-card-foreground shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={`Póster de ${title}`}
            fill
            priority={priority}
            sizes="160px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {score && (
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md border-2 border-foreground bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-black shadow-[2px_2px_0_0_var(--foreground)]">
            <Star className="size-3 fill-black text-black" />
            {score}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 p-2.5">
        <p className="line-clamp-2 min-h-[2.4em] text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
          {title}
        </p>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-md border border-primary/50 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-primary"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
