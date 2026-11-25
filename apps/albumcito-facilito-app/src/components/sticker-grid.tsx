"use client";

import { useEffect, useRef, useState } from "react";

export interface GridSticker {
  id: string;
  number: number;
  name: string;
}

interface Props {
  stickers: GridSticker[];
  /** `owned` = estampa de la colección del usuario (borde sólido). */
  variant?: "album" | "owned";
}

const tile = {
  album: "border-2 border-dashed border-indigo-300 hover:border-indigo-600",
  owned: "border-2 border-indigo-400 hover:border-indigo-600",
} as const;

function finish(dialog: HTMLDialogElement | null, origin: HTMLElement | null) {
  if (!dialog) return;
  dialog.removeAttribute("data-closing");
  dialog.close();
  origin?.focus();
}

/** Mosaico de estampas; al activar una se abre un visor modal (`<dialog>`) ampliado. */
export function StickerGrid({ stickers, variant = "album" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<GridSticker | null>(null);

  function open(sticker: GridSticker, origin: HTMLElement) {
    originRef.current = origin;
    setSelected(sticker);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.removeAttribute("data-closing");
      dialog.showModal();
    }
  }

  function finishClose() {
    finish(dialogRef.current, originRef.current);
  }

  // Listener nativo: cierra de verdad cuando termina la animación de salida.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onEnd = (e: Event) => {
      if (e.target === dialog && dialog.hasAttribute("data-closing")) {
        finish(dialog, originRef.current);
      }
    };
    dialog.addEventListener("animationend", onEnd);
    return () => dialog.removeEventListener("animationend", onEnd);
  }, []);

  function close() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finishClose();
    } else {
      dialog.setAttribute("data-closing", "");
    }
  }

  return (
    <>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stickers.map((sticker) => (
          <li key={sticker.id}>
            <button
              type="button"
              onClick={(e) => open(sticker, e.currentTarget)}
              aria-label={`Ver ${sticker.name} en grande`}
              className={`flex aspect-[3/4] w-full cursor-zoom-in flex-col items-center justify-center rounded-xl p-3 text-center transition duration-200 hover:shadow-md motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.03] motion-safe:active:scale-95 ${tile[variant]}`}
            >
              <span className="text-2xl font-bold text-indigo-600">#{sticker.number}</span>
              <span className="mt-2 text-sm">{sticker.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={selected ? `Estampa ${selected.name}` : "Estampa"}
        className="sticker-viewer m-auto w-[min(90vw,24rem)] rounded-2xl border-4 border-indigo-500 bg-white p-0 backdrop:bg-black/60"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {selected && (
          <div className="flex aspect-[3/4] flex-col items-center justify-center p-8 text-center">
            <span className="text-7xl font-bold text-indigo-600">#{selected.number}</span>
            <span className="mt-4 text-2xl font-semibold">{selected.name}</span>
          </div>
        )}
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-sm text-white transition hover:bg-indigo-700 motion-safe:active:scale-95"
        >
          Cerrar
        </button>
      </dialog>
    </>
  );
}
