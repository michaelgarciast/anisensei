"use client";

import { motion } from "framer-motion";
import { AnimeCard } from "@/features/anime/components/AnimeCard";
import type { Anime } from "@/features/anime/schemas";

interface AnimeCardListProps {
  readonly animes: Anime[];
}

export function AnimeCardList({ animes }: AnimeCardListProps) {
  return (
    <ul
      className="flex list-none gap-3 overflow-x-auto py-2"
      aria-label="Resultados de anime"
    >
      {animes.map((anime, index) => (
        <motion.li
          key={anime.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.4) }}
        >
          <AnimeCard anime={anime} />
        </motion.li>
      ))}
    </ul>
  );
}
