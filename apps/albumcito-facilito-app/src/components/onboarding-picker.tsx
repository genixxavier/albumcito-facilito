"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addStickerAction, type AddStickerState } from "@/app/actions";
import type { AlbumStickers } from "@/lib/api";

interface Props {
  username: string;
  albums: AlbumStickers[];
}

export function OnboardingPicker({ username, albums }: Props) {
  const [state, formAction, pending] = useActionState<AddStickerState, FormData>(
    addStickerAction,
    {},
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Elige tu primera estampa</h1>
      <p className="mt-2 text-gray-600">
        Empieza tu colección: toca una estampa de Cody para añadirla a tu álbum.
      </p>

      {state.added && (
        <div role="status" className="mt-6 rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="font-medium text-green-800">¡Añadiste «{state.added}» a tu colección!</p>
          <Link
            href={`/${username}`}
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Ir a mi colección
          </Link>
        </div>
      )}
      {state.error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {albums.map(({ album, stickers }) => (
        <section key={album.id} className="mt-8" aria-labelledby={`album-${album.id}`}>
          <h2 id={`album-${album.id}`} className="text-xl font-semibold">
            {album.title}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stickers.map((sticker) => (
              <li key={sticker.id}>
                <form action={formAction}>
                  <input type="hidden" name="stickerId" value={sticker.id} />
                  <input type="hidden" name="stickerName" value={sticker.name} />
                  <button
                    type="submit"
                    disabled={pending}
                    aria-label={`Añadir ${sticker.name}`}
                    className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 p-3 text-center hover:border-indigo-600 disabled:opacity-60"
                  >
                    <span className="text-2xl font-bold text-indigo-600">#{sticker.number}</span>
                    <span className="mt-2 text-sm">{sticker.name}</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!state.added && (
        <Link href={`/${username}`} className="mt-8 inline-block text-sm text-gray-600 underline">
          Omitir por ahora
        </Link>
      )}
    </main>
  );
}
