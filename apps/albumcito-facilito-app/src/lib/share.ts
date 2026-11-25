export type ShareNetworkId = "facebook" | "x" | "whatsapp" | "telegram" | "email";

export interface ShareLink {
  id: ShareNetworkId;
  label: string;
  href: string;
}

interface ShareInput {
  /** URL absoluta a compartir. */
  url: string;
  /** Texto descriptivo (p. ej. el título del álbum). */
  text: string;
}

const enc = encodeURIComponent;

/** Enlaces de compartir de cada red; todos los valores van codificados. */
export function buildShareLinks({ url, text }: ShareInput): ShareLink[] {
  return [
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}`,
    },
    {
      id: "x",
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
    },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    },
    {
      id: "email",
      label: "Correo",
      href: `mailto:?subject=${enc(text)}&body=${enc(`${text}\n${url}`)}`,
    },
  ];
}

/** URL absoluta de un álbum, o de una estampa si se indica `stickerId`. */
export function sharePath(albumId: string, stickerId?: string): string {
  const base = `/albums/${albumId}`;
  return stickerId ? `${base}#sticker-${stickerId}` : base;
}
