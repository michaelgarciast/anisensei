import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Link directo a "/" en lugar de router.back(): así el chat siempre está
// disponible aunque el usuario llegue al detalle desde un enlace externo.
export function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Volver al chat
    </Link>
  );
}
