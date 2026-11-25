import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { getMe } from "@/lib/api";
import { getSession } from "@/lib/session";

export default async function DashboardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const token = await getSession();
  const me = token ? await getMe(token) : null;

  if (!me) redirect("/login");
  if (me.username !== username) redirect(`/${me.username}`);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Hola, {me.name}</h1>
      <p className="mt-2 text-gray-600">{me.email}</p>
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
