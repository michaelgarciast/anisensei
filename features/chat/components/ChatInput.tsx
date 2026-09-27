"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_CHAT_MESSAGE_LENGTH } from "../schemas";

interface ChatInputProps {
  readonly onSend: (text: string) => void;
  readonly disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !disabled && value.trim().length > 0;

  function autosize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function submit() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    requestAnimationFrame(autosize);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 rounded-2xl border-2 border-foreground/15 bg-card/90 p-2 shadow-sm backdrop-blur-sm transition-all focus-within:border-primary focus-within:shadow-[3px_3px_0_0_var(--primary)]"
    >
      <textarea
        ref={textareaRef}
        id="chat-message"
        name="message"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autosize();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Pregunta por un anime... (p. ej. “recomiéndame algo parecido a Death Note”)"
        rows={1}
        maxLength={MAX_CHAT_MESSAGE_LENGTH}
        disabled={disabled}
        aria-label="Mensaje para AniChat"
        className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!canSend}
        aria-label="Enviar mensaje"
        className="size-9 rounded-lg border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-0 active:shadow-none"
      >
        <SendHorizonal className="size-4" />
      </Button>
    </form>
  );
}
