import { buildShareLinks, sharePath } from "./share";

const url = "https://albumcito.test/albums/cody-espacio#sticker-s-12";
const text = "Cody & el #espacio ñandú";

describe("buildShareLinks", () => {
  const links = Object.fromEntries(buildShareLinks({ url, text }).map((l) => [l.id, l.href]));

  it("devuelve las cinco redes", () => {
    expect(Object.keys(links)).toEqual(["facebook", "x", "whatsapp", "telegram", "email"]);
  });

  it("construye cada href", () => {
    expect(links.facebook).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    );
    expect(links.x).toBe(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    );
    expect(links.whatsapp).toBe(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
    expect(links.telegram).toBe(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    );
    expect(links.email).toContain("mailto:?subject=");
  });

  it("codifica &, # y acentos para que el destino reciba el texto íntegro", () => {
    const params = new URL(links.x).searchParams;
    expect(params.get("text")).toBe(text);
    expect(params.get("url")).toBe(url);
    expect(new URL(links.whatsapp).searchParams.get("text")).toBe(`${text} ${url}`);
    expect(links.x).not.toContain("& el");
  });
});

describe("sharePath", () => {
  it("álbum y estampa", () => {
    expect(sharePath("cody-espacio")).toBe("/albums/cody-espacio");
    expect(sharePath("cody-espacio", "s-12")).toBe("/albums/cody-espacio#sticker-s-12");
  });
});
