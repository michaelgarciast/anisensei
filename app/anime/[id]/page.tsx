import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimeDetail } from "@/features/anime/components/AnimeDetail";
import { BackButton } from "@/features/anime/components/BackButton";
import { getAnimeById } from "@/features/anime/server/getAnimeById";
import { AniListApiError } from "@/features/anime/server/anilistClient";
import type { AnimeDetail as AnimeDetailData } from "@/features/anime/schemas";

// Dedup el fetch entre generateMetadata y la página en el mismo request.
const getAnimeByIdCached = cache(getAnimeById);

function parseAnimeId(rawId: string): number | null {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

async function fetchAnime(id: number): Promise<AnimeDetailData | null> {
  try {
    return await getAnimeByIdCached(id);
  } catch (error) {
    if (error instanceof AniListApiError && error.status === 404) return null;
    // Rate limiting o caídas de AniList no son "no encontrado": re-lanzamos para
    // que Next muestre la pantalla de error correspondiente.
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/anime/[id]">): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parseAnimeId(rawId);
  if (id === null) return { title: "Anime no encontrado — AniChat" };

  try {
    const anime = await getAnimeByIdCached(id);
    const title = anime.title.english ?? anime.title.romaji;
    return {
      title: `${title} — AniChat`,
      description: anime.description ?? undefined,
    };
  } catch {
    return { title: "Detalle de anime — AniChat" };
  }
}

export default async function AnimePage({ params }: PageProps<"/anime/[id]">) {
  const { id: rawId } = await params;
  const id = parseAnimeId(rawId);
  if (id === null) notFound();

  const anime = await fetchAnime(id);
  if (!anime) notFound();

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 pt-4">
        <BackButton />
      </div>
      <AnimeDetail anime={anime} />
    </main>
  );
}
