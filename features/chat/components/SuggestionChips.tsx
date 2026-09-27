"use client";

import { motion } from "framer-motion";

const SUGGESTIONS = [
  "Animes de este año",
  "Parecidos a Death Note",
  "¿Qué hay de temporada ahora?",
  "Un shonen hype para maratonear",
] as const;

interface SuggestionChipsProps {
  readonly onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 + index * 0.07 }}
          className="rounded-lg border-2 border-foreground/70 bg-card px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-[4px_4px_0_0_var(--primary)] active:translate-y-0 active:shadow-[1px_1px_0_0_var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-primary">▸</span> {suggestion}
        </motion.button>
      ))}
    </div>
  );
}
