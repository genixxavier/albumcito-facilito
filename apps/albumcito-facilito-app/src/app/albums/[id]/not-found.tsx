import Link from "next/link";

export default function AlbumNotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">Álbum no encontrado</h1>
      <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
        Volver a los álbumes
      </Link>
    </main>
  );
}
