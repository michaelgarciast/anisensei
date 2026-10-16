import Image from "next/image";
import type { AnimeCharacterEntry } from "../schemas";
import { DetailSection } from "./DetailSection";

interface CharacterListProps {
  readonly characters: AnimeCharacterEntry[];
  readonly limit?: number;
}

export function CharacterList({ characters, limit = 8 }: CharacterListProps) {
  const mains = characters.filter((entry) => entry.role === "MAIN");
  const visible = (mains.length > 0 ? mains : characters).slice(0, limit);

  if (visible.length === 0) return null;

  return (
    <DetailSection id="characters-heading" title="Personajes principales">
      <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-4">
        {visible.map(({ character, voiceActors }) => {
          const japaneseVA = voiceActors.find((va) => va.language === "Japanese");
          const portrait = character.image.large ?? character.image.medium;
          return (
            <li key={character.id} className="flex min-w-0 flex-col items-center gap-3 text-center">
              <div className="relative aspect-square w-full max-w-24 overflow-hidden rounded-full border-2 border-foreground/15 bg-muted shadow-sm sm:max-w-28">
                {portrait ? (
                  <Image
                    src={portrait}
                    alt={`Imagen de ${character.name.full}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    N/A
                  </div>
                )}
              </div>
              <div className="w-full">
                <p className="truncate text-sm font-medium" title={character.name.full}>
                  {character.name.full}
                </p>
                {japaneseVA && (
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={`Voz: ${japaneseVA.name.full}`}
                  >
                    {japaneseVA.name.full}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </DetailSection>
  );
}
