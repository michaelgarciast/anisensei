import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Link directo a "/" en lugar de router.back(): así el chat siempre está
// disponible aunque el usuario llegue al detalle desde un enlace externo.
// Va sobre el banner: fondo oscuro translúcido para leer sobre cualquier imagen.
export function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3.5 py-1.5 text-sm text-white shadow-md backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Volver al chat
    </Link>
  );
}
