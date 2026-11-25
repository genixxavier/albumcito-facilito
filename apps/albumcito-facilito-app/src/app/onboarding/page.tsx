import { redirect } from "next/navigation";
import { OnboardingPicker } from "@/components/onboarding-picker";
import { getAlbums, getAlbumStickers, getMe, type AlbumStickers } from "@/lib/api";
import { getSession } from "@/lib/session";

export const metadata = { title: "Tu primera estampa · Albumcito Facilito" };

export default async function OnboardingPage() {
  const token = await getSession();
  const me = token ? await getMe(token) : null;

  if (!me) redirect("/login");
  // Solo cuentas nuevas con el onboarding pendiente; el resto va a su dashboard.
  if (me.onboarding !== false) redirect(`/${me.username}`);

  const summaries = await getAlbums();
  const albums = (await Promise.all(summaries.map((a) => getAlbumStickers(a.id)))).filter(
    (a): a is AlbumStickers => a !== null,
  );

  return <OnboardingPicker username={me.username} albums={albums} />;
}
