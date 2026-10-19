"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { formatNextEpisode, type Anime } from "../schemas";

export function NextEpisodeBadge({ next }: { readonly next: Anime["nextAiringEpisode"] }) {
  const [now] = useState(() => Date.now());
  const label = formatNextEpisode(next, now);
  if (!label) return null;

  return (
    <p className="flex items-center gap-1 font-mono text-[10px] font-bold text-muted-foreground">
      <Clock className="size-3" />
      {label}
    </p>
  );
}
