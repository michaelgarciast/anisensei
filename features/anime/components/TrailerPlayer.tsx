"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface TrailerPlayerProps {
  readonly embedUrl: string;
  readonly thumbnail: string | null;
  readonly title: string;
}

/** Fachada click-to-play: el iframe (y toda la telemetría de YouTube) se carga solo al pulsar. */
export function TrailerPlayer({ embedUrl, thumbnail, title }: TrailerPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-foreground/15 bg-black">
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Ver trailer: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border-2 border-foreground/15 bg-black text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {thumbnail && (
        <Image
          src={thumbnail}
          alt={`Miniatura del trailer: ${title}`}
          fill
          sizes="(max-width: 1024px) 100vw, 720px"
          className="object-cover opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="flex size-14 items-center justify-center rounded-full border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-transform duration-300 group-hover:scale-110">
          <Play className="size-6 fill-current" aria-hidden />
        </span>
      </span>
      <span className="absolute bottom-3 left-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
        Ver trailer en YouTube
      </span>
    </button>
  );
}
