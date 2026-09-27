import Image from "next/image";
import type { AnimeCharacterEntry } from "../schemas";

interface CharacterListProps {
  readonly characters: AnimeCharacterEntry[];
  readonly limit?: number;
}

export function CharacterList({ characters, limit = 8 }: CharacterListProps) {
  const mains = characters.filter((entry) => entry.role === "MAIN");
  const visible = (mains.length > 0 ? mains : characters).slice(0, limit);

  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="characters-heading" className="space-y-3">
      <h2 id="characters-heading" className="text-lg font-semibold">
        Personajes principales
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visible.map(({ character, voiceActors }) => {
          const japaneseVA = voiceActors.find((va) => va.language === "Japanese");
          const portrait = character.image.large ?? character.image.medium;
          return (
            <li
              key={character.id}
              className="flex items-center gap-3 overflow-hidden rounded-xl border bg-card p-2"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {portrait ? (
                  <Image
                    src={portrait}
                    alt={`Imagen de ${character.name.full}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    N/A
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={character.name.full}>
                  {character.name.full}
                </p>
                {japaneseVA && (
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={japaneseVA.name.full}
                  >
                    {japaneseVA.name.full}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
