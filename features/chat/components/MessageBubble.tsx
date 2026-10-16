"use client";

import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import type { ChatUIMessage } from "../types";
import { AnimeCardList } from "./AnimeCardList";

const markdownComponents: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1.5 pl-5 marker:text-primary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-primary">
      {children}
    </ol>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  h2: ({ children }) => (
    <h2 className="mb-1 mt-3 font-heading text-base font-bold uppercase tracking-wide first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-3 font-heading text-sm font-bold uppercase tracking-wide first:mt-0">
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-primary/40 bg-accent/50 py-1 pl-3 pr-2 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
  ),
  hr: () => <hr className="my-3 border-border" />,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
};

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
      <div
        className={`flex w-full max-w-[92%] gap-3 sm:max-w-[85%] ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <div className="relative mt-auto shrink-0">
            <div aria-hidden className="absolute -inset-1 rounded-xl bg-primary/25 blur-md" />
            <div className="relative flex size-9 select-none items-center justify-center rounded-xl border-2 border-foreground bg-linear-to-br from-primary to-accent-foreground text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)]">
              <Swords className="size-4" aria-hidden />
            </div>
          </div>
        )}
        <div
          className={`flex min-w-0 flex-1 flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
        >
          {!isUser && (
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              AniSensei
            </span>
          )}
          {message.parts.map((part, index) => {
            if (part.type === "text" && part.text.length > 0) {
              return (
                <div
                  key={`${message.id}-text-${index}`}
                  className={`max-w-full wrap-anywhere rounded-2xl px-5 py-3.5 text-[15px] leading-7 ${
                    isUser
                      ? "whitespace-pre-wrap rounded-br-sm border-2 border-foreground bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]"
                      : "rounded-bl-sm border-2 border-primary/20 bg-card text-card-foreground shadow-md shadow-black/5"
                  }`}
                >
                  {isUser ? (
                    part.text
                  ) : (
                    <ReactMarkdown components={markdownComponents}>{part.text}</ReactMarkdown>
                  )}
                  {!isUser && isStreaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-foreground/60 align-text-bottom" />
                  )}
                </div>
              );
            }
            if (part.type === "data-anime-results" && part.data.length > 0) {
              return (
                <div key={`${message.id}-anime-${index}`} className="w-full">
                  <AnimeCardList animes={part.data} />
                  <p className="mt-1 text-xs text-muted-foreground">Datos en vivo de AniList</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </motion.div>
  );
}
