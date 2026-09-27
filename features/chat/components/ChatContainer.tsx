"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ChatUIMessage } from "../types";
import { MAX_CHAT_MESSAGE_LENGTH, MAX_CHAT_MESSAGES } from "../schemas";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { SuggestionChips } from "./SuggestionChips";

const STORAGE_KEY = "anichat_history";
const transport = new DefaultChatTransport<ChatUIMessage>({
  prepareSendMessagesRequest: ({ messages }) => ({
    body: {
      messages: messages
        .slice(-MAX_CHAT_MESSAGES)
        .map((message) => ({
          role: message.role,
          parts: [
            {
              type: "text",
              text: message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("")
                .slice(0, MAX_CHAT_MESSAGE_LENGTH),
            },
          ],
        }))
        .filter((message) => message.parts[0].text.length > 0),
    },
  }),
});

export function ChatContainer() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { messages, setMessages, sendMessage, status, error } = useChat<ChatUIMessage>({
    transport,
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setMessages(JSON.parse(stored) as ChatUIMessage[]);
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [setMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const isStreaming = status === "streaming";
  const isBusy = status === "submitted" || isStreaming;
  const showThinking = status === "submitted";
  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (!isLoaded || (status !== "ready" && status !== "error")) return;
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
      } catch (e) {
        console.error("Failed to save chat history", e);
      }
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [messages, isLoaded, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function handleSend(text: string) {
    void sendMessage({ text });
  }

  function handleClear() {
    if (confirm("¿Estás seguro de querer borrar el historial?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  if (!isLoaded) return null;

  return (
    <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden bg-background sm:h-[min(92dvh,900px)] sm:rounded-3xl sm:border sm:border-border/60 sm:shadow-2xl sm:shadow-black/10">
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b-2 border-foreground/15 bg-background/70 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]">
            <Swords className="size-4" aria-hidden />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold uppercase leading-tight tracking-wide">
              AniChat
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex size-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Tu asistente de anime</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {!isEmpty && (
            <button
              onClick={handleClear}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Borrar historial"
              aria-label="Borrar historial"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-6">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full flex-col items-center justify-center gap-8 text-center"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 rotate-45 rounded-2xl border-2 border-dashed border-primary/40"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="relative flex size-16 items-center justify-center rounded-2xl border-2 border-foreground bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--foreground)]"
                >
                  <Swords className="size-7" aria-hidden />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-3xl font-bold uppercase tracking-wide text-foreground">
                  ¿Qué anime andas buscando?
                </h2>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                  Pídeme recomendaciones por género, año o parecido a tu anime favorito, y te traigo
                  los datos reales con su puntaje y géneros.
                </p>
              </div>
            </div>
            <SuggestionChips onSelect={handleSend} />
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={
                  isStreaming && index === messages.length - 1 && message.role === "assistant"
                }
              />
            ))}
            {showThinking && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-sm border-2 border-foreground/15 bg-card px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-muted-foreground shadow-sm"
                role="status"
                aria-live="polite"
              >
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="size-1.5 animate-bounce rounded-full bg-primary/70"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                </span>
                <span>Pensando...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p
          className="shrink-0 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive"
          role="alert"
        >
          Algo salió mal al generar la respuesta. Intenta de nuevo.
        </p>
      )}

      <div className="shrink-0 px-4 pb-4 pt-2">
        <ChatInput onSend={handleSend} disabled={isBusy} />
      </div>
    </div>
  );
}
