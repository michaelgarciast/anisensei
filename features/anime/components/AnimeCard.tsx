import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Anime } from "../schemas";

interface AnimeCardProps {
  readonly anime: Pick<Anime, "id" | "title" | "coverImage" | "averageScore" | "genres">;
}

// AniList puntúa de 0 a 100; lo mostramos en escala de 10 como antes.
function scoreOn10(averageScore: number | null): string | null {
  return averageScore != null ? (averageScore / 10).toFixed(1) : null;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const poster = anime.coverImage.extraLarge ?? anime.coverImage.large ?? null;
  const score = scoreOn10(anime.averageScore);
  const genres = anime.genres.slice(0, 3);

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border-2 border-foreground/15 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground hover:shadow-[4px_4px_0_0_var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={`Póster de ${title}`}
            fill
            sizes="144px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {score && (
          <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md border-2 border-foreground bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold text-black shadow-[2px_2px_0_0_var(--foreground)]">
            <Star className="size-3 fill-black text-black" />
            {score}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-2">
        <p className="line-clamp-2 text-xs font-medium leading-tight transition-colors group-hover:text-primary">
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
