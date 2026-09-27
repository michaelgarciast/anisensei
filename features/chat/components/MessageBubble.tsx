"use client";

import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import type { ChatUIMessage } from "../types";
import { AnimeCardList } from "./AnimeCardList";

interface MessageBubbleProps {
  readonly message: ChatUIMessage;
  readonly isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex w-full max-w-[85%] gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="mt-auto flex size-8 shrink-0 select-none items-center justify-center rounded-lg border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)]">
            <Swords className="size-3.5" aria-hidden />
          </div>
        )}
        <div className={`flex flex-col gap-1 w-full ${isUser ? "items-end" : "items-start"}`}>
          {message.parts.map((part, index) => {
            if (part.type === "text" && part.text.length > 0) {
              return (
                <div
                  key={`${message.id}-text-${index}`}
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "rounded-br-sm border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]"
                      : "rounded-bl-sm border-2 border-foreground/15 bg-card text-card-foreground shadow-sm"
                  }`}
                >
                  {part.text}
                  {!isUser && isStreaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-foreground/60 align-text-bottom" />
                  )}
                </div>
              );
            }
            if (part.type === "data-anime-results" && part.data.length > 0) {
              return <AnimeCardList key={`${message.id}-anime-${index}`} animes={part.data} />;
            }
            return null;
          })}
        </div>
      </div>
    </motion.div>
  );
}
