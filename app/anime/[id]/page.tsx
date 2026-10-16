import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimeDetail } from "@/features/anime/components/AnimeDetail";
import { getAnimeById } from "@/features/anime/server/getAnimeById";
import { AniListApiError } from "@/features/anime/server/anilistClient";
import { cleanAnimeDescription, type AnimeDetail as AnimeDetailData } from "@/features/anime/schemas";


const getAnimeByIdCached = cache(async (id: number): Promise<AnimeDetailData> => {
  const anime = await getAnimeById(id);
  if (!anime) notFound();
  return anime;
});

function parseAnimeId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
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
      description: anime.description ? cleanAnimeDescription(anime.description) : undefined,
    };
  } catch {
    return { title: "Detalle de anime — AniChat" };
  }
}

async function fetchAnime(id: number): Promise<AnimeDetailData | null> {
  try {
    return await getAnimeByIdCached(id);
  } catch (error) {
    if (error instanceof AniListApiError && error.status === 404) return null;
    throw error;
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
      <AnimeDetail anime={anime} />
    </main>
  );
}
