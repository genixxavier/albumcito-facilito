import Link from "next/link";
import { getAlbums } from "@/lib/api";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Albumcito Facilito</h1>
      <nav className="mt-2 flex gap-4 text-sm text-indigo-600 underline">
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/signup">Crear cuenta</Link>
      </nav>
      <p className="mt-2 text-gray-600">Elige un álbum para ver sus estampas de Cody.</p>
      <h2 className="sr-only">Álbumes</h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <li key={album.id}>
            <Link
              href={`/albums/${album.id}`}
              className="block h-full rounded-xl border border-gray-200 p-5 transition hover:border-indigo-500 hover:shadow-md"
            >
              <span className="block text-lg font-semibold">{album.title}</span>
              <span className="mt-1 block text-sm text-gray-600">{album.description}</span>
              <span className="mt-3 block text-sm font-medium text-indigo-600">
                {album.stickerCount} estampas
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
