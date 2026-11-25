"use client";

import { useEffect, useRef, useState } from "react";
import { buildShareLinks } from "@/lib/share";

interface Props {
  /** Nombre del álbum o estampa; título del modal y texto compartido. */
  title: string;
  /** Ruta relativa a compartir (`/albums/<id>` o con `#sticker-<id>`). */
  path: string;
  /** Variante compacta para estampas. */
  compact?: boolean;
}

type CopyState = "idle" | "copied" | "failed";

/** Botón "Compartir" que abre un modal con redes sociales, copiar enlace y Web Share API. */
export function ShareButton({ title, path, compact = false }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copy, setCopy] = useState<CopyState>("idle");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (url && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [url]);

  function open() {
    setCopy("idle");
    setCanNativeShare(typeof navigator.share === "function");
    setUrl(`${window.location.origin}${path}`);
  }

  function close() {
    dialogRef.current?.close();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url!);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: title, url: url! });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
    }
  }

  const optionClass =
    "block w-full rounded-lg border border-gray-300 px-3 py-2 text-left text-sm font-medium hover:border-indigo-500 hover:text-indigo-600";

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={compact ? `Compartir ${title}` : "Compartir"}
        className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-indigo-400 hover:text-indigo-600"
      >
        <span aria-hidden="true">↗</span> Compartir
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={url ? `share-title-${path}` : undefined}
        onClose={() => setUrl(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-full max-w-sm rounded-2xl p-0 backdrop:bg-black/50"
      >
        {url && (
          <div className="p-6">
            <h2 id={`share-title-${path}`} className="text-lg font-semibold">
              Compartir {title}
            </h2>
            <ul className="mt-4 space-y-2">
              {buildShareLinks({ url, text: title }).map((link) => (
                <li key={link.id}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={optionClass}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={copyLink} className={optionClass}>
                  Copiar enlace
                </button>
              </li>
              {canNativeShare && (
                <li>
                  <button type="button" onClick={nativeShare} className={optionClass}>
                    Compartir con…
                  </button>
                </li>
              )}
            </ul>
            {copy === "copied" && (
              <p role="status" className="mt-3 text-sm text-green-700">
                Enlace copiado
              </p>
            )}
            {copy === "failed" && (
              <input
                readOnly
                aria-label="Enlace para compartir"
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                autoFocus
                className="mt-3 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            )}
            <button
              type="button"
              onClick={close}
              className="mt-4 text-sm font-medium text-gray-600 underline"
            >
              Cerrar
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
