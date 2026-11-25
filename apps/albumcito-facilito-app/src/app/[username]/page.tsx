import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { getCollection, getMe } from "@/lib/api";
import { getSession } from "@/lib/session";

export default async function DashboardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const token = await getSession();
  const me = token ? await getMe(token) : null;

  if (!token || !me) redirect("/login");
  if (me.username !== username) redirect(`/${me.username}`);

  const collection = await getCollection(token);
  const stickers = collection.ok ? collection.data.stickers : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Hola, {me.name}</h1>
      <p className="mt-2 text-gray-600">{me.email}</p>
      <h2 className="mt-8 text-xl font-semibold">Mi colección</h2>
      {stickers.length === 0 ? (
        <p className="mt-2 text-gray-600">Aún no tienes estampas.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stickers.map((sticker) => (
            <li
              key={sticker.id}
              className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-indigo-400 p-3 text-center"
            >
              <span className="text-2xl font-bold text-indigo-600">#{sticker.number}</span>
              <span className="mt-2 text-sm">{sticker.name}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex items-center gap-4">
        <Link href="/" className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Ver álbumes
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
