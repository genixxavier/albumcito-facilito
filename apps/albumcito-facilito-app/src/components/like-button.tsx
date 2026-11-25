"use client";

import { useOptimistic } from "react";
import { toggleLikeAction } from "@/app/actions";

interface Props {
  albumId: string;
  likeCount: number;
  liked: boolean;
}

/** Botón de "me gusta" con actualización optimista; sin sesión la acción redirige a `/login`. */
export function LikeButton({ albumId, likeCount, liked }: Props) {
  const [state, setOptimistic] = useOptimistic({ liked, likeCount }, (_prev, next: Props) => next);

  async function submit(data: FormData) {
    setOptimistic({
      albumId,
      liked: !liked,
      likeCount: Math.max(0, likeCount + (liked ? -1 : 1)),
    });
    await toggleLikeAction(data);
  }

  return (
    <form action={submit}>
      <input type="hidden" name="albumId" value={albumId} />
      <input type="hidden" name="like" value={String(!liked)} />
      <button
        type="submit"
        aria-pressed={state.liked}
        aria-label={state.liked ? "Quitar me gusta" : "Me gusta"}
        className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
          state.liked
            ? "border-pink-500 bg-pink-50 text-pink-600"
            : "border-gray-300 text-gray-600 hover:border-pink-400"
        }`}
      >
        <span aria-hidden="true">{state.liked ? "♥" : "♡"}</span> {state.likeCount}
      </button>
    </form>
  );
}
