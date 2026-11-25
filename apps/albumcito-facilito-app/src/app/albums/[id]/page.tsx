import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/share-button";
import { getAlbumStickers } from "@/lib/api";
import { sharePath } from "@/lib/share";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getAlbumStickers(id);
  return { title: data ? `${data.album.title} · Albumcito Facilito` : "Álbum no encontrado" };
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const data = await getAlbumStickers(id);
  if (!data) notFound();

  const { album, stickers } = data;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← Volver a los álbumes
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{album.title}</h1>
      <p className="mt-2 text-gray-600">{album.description}</p>
      <div className="mt-3">
        <ShareButton title={album.title} path={sharePath(album.id)} />
      </div>
      <h2 className="mt-8 text-xl font-semibold">Estampas de Cody</h2>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stickers.map((sticker) => (
          <li
            key={sticker.id}
            id={`sticker-${sticker.id}`}
            className="flex aspect-[3/4] scroll-mt-6 flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 p-3 text-center target:border-solid target:bg-indigo-50"
          >
            <span className="text-2xl font-bold text-indigo-600">#{sticker.number}</span>
            <span className="mt-2 text-sm">{sticker.name}</span>
            <span className="mt-2">
              <ShareButton title={sticker.name} path={sharePath(album.id, sticker.id)} compact />
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
