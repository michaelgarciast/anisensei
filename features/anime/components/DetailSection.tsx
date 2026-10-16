import type { ReactNode } from "react";

interface DetailSectionProps {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}

export function DetailSection({ id, title, children }: DetailSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="space-y-4 rounded-2xl border-2 border-foreground/15 bg-card p-5 shadow-md shadow-black/5 sm:p-6"
    >
      <h2
        id={id}
        className="flex items-center gap-3 font-heading text-xl font-bold uppercase tracking-wide"
      >
        <span aria-hidden className="h-6 w-1.5 rounded-full bg-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}
