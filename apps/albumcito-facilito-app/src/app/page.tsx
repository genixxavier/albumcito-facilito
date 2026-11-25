import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { sharePath } from "@/lib/share";
import {
  getAlbums,
  getMyLikes,
  getTopAlbums,
  getTopStickers,
  type AlbumSummary,
} from "@/lib/api";
import { getSession } from "@/lib/session";

/** Los highlights son un extra: si fallan, la home sigue mostrando el listado. */
async function orFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function AlbumCard({ album, liked }: { album: AlbumSummary; liked: boolean }) {
  return (
    <li className="flex h-full flex-col rounded-xl border border-gray-200 p-5 transition hover:border-indigo-500 hover:shadow-md">
      <Link href={`/albums/${album.id}`} className="block flex-1">
        <span className="block text-lg font-semibold">{album.title}</span>
        <span className="mt-1 block text-sm text-gray-600">{album.description}</span>
        <span className="mt-3 block text-sm font-medium text-indigo-600">
          {album.stickerCount} estampas
        </span>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <LikeButton albumId={album.id} likeCount={album.likeCount} liked={liked} />
        <ShareButton title={album.title} path={sharePath(album.id)} />
      </div>
    </li>
  );
}

export default async function Home() {
  const token = await getSession();
  const [albums, topAlbums, topStickers, myLikes] = await Promise.all([
    getAlbums(),
    orFallback(getTopAlbums(), []),
    orFallback(getTopStickers(), []),
    token ? orFallback(getMyLikes(token), null) : Promise.resolve(null),
  ]);
  const liked = new Set(myLikes ?? []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Albumcito Facilito</h1>
      <nav className="mt-2 flex gap-4 text-sm text-indigo-600 underline">
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/signup">Crear cuenta</Link>
      </nav>
      <p className="mt-2 text-gray-600">Elige un álbum para ver sus estampas de Cody.</p>

      {topStickers.length > 0 && (
        <section className="mt-8" aria-labelledby="top-stickers">
          <h2 id="top-stickers" className="text-xl font-semibold">
            Estampas top
          </h2>
          <ol aria-label="Estampas top" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topStickers.map((sticker) => (
              <li key={sticker.id} className="rounded-xl border border-gray-200 p-4">
                <Link href={`/albums/${sticker.albumId}`} className="block">
                  <span className="block font-medium">{sticker.name}</span>
                  <span className="mt-1 block text-sm text-gray-600">
                    {sticker.collectorCount}{" "}
                    {sticker.collectorCount === 1 ? "coleccionista" : "coleccionistas"}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {topAlbums.length > 0 && (
        <section className="mt-8" aria-labelledby="top-albums">
          <h2 id="top-albums" className="text-xl font-semibold">
            Álbumes más gustados
          </h2>
          <ol
            aria-label="Álbumes más gustados"
            className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {topAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} liked={liked.has(album.id)} />
            ))}
          </ol>
        </section>
      )}

      <h2 className="mt-8 text-xl font-semibold">Álbumes</h2>
      <ul aria-label="Álbumes" className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} liked={liked.has(album.id)} />
        ))}
      </ul>
    </main>
  );
}
