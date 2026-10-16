"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClearHistoryDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Borrar historial"
        aria-label="Borrar historial"
      >
        <Trash2 className="size-4" aria-hidden />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-foreground bg-background p-6 shadow-[6px_6px_0_0_var(--foreground)] transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="mb-4 flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-destructive/15 text-destructive">
            <Trash2 className="size-5" aria-hidden />
          </div>
          <AlertDialog.Title className="font-heading text-lg font-bold uppercase tracking-wide">
            Borrar historial
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            Se eliminará toda la conversación de este navegador. Esta acción no se puede deshacer.
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="outline" size="lg" />}>
              Cancelar
            </AlertDialog.Close>
            <AlertDialog.Close
              render={<Button variant="destructive" size="lg" />}
              onClick={onConfirm}
            >
              Borrar
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
