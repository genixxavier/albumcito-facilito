import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import AlbumPage from "@/app/albums/[id]/page";
import Home from "@/app/page";
import { getAlbums, getAlbumStickers, getMyLikes, getTopAlbums, getTopStickers } from "@/lib/api";
import { getSession } from "@/lib/session";

vi.mock("@/lib/api", () => ({
  getAlbums: vi.fn(),
  getAlbumStickers: vi.fn(),
  getTopAlbums: vi.fn(),
  getTopStickers: vi.fn(),
  getMyLikes: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));
vi.mock("@/app/actions", () => ({ toggleLikeAction: vi.fn() }));

const feature = await loadFeature("src/features/share.feature");

const IDS: Record<string, string> = {
  "Las aventuras de Cody": "cody-aventuras",
  "Cody en el espacio": "cody-espacio",
};

const album = (title: string) => ({
  id: IDS[title],
  title,
  description: "",
  stickerCount: 0,
  likeCount: 0,
});

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  BeforeEachScenario(() => {
    // jsdom no implementa <dialog>.showModal/close.
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
    for (const fn of [getAlbums, getAlbumStickers, getTopAlbums, getTopStickers, getMyLikes]) {
      vi.mocked(fn).mockReset();
    }
    vi.mocked(getSession).mockReset().mockResolvedValue(undefined);
    vi.mocked(getTopAlbums).mockResolvedValue([]);
    vi.mocked(getTopStickers).mockResolvedValue([]);
  });
  AfterEachScenario(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderAsync = async (page: Promise<ReactNode>) => {
    render(await page);
  };
  const givenAlbums = (_ctx: unknown, a: string, b: string) => {
    vi.mocked(getAlbums).mockResolvedValue([album(a), album(b)]);
  };
  const openHome = async () => {
    await renderAsync(Home());
  };
  const cardOf = (title: string) => screen.getByRole("link", { name: new RegExp(title) }).closest("li")!;
  const dialogOf = (name: string) => screen.getByRole("dialog", { name });
  const openCard = (_ctx: unknown, title: string) => {
    fireEvent.click(within(cardOf(title)).getByRole("button", { name: "Compartir" }));
  };

  Scenario("Cada álbum de la home tiene botón de compartir", ({ Given, When, Then }) => {
    Given("la API tiene los álbumes {string} y {string}", givenAlbums);
    When("abro la página de inicio sin sesión", openHome);
    Then("veo {number} botones {string}", (_ctx, count: number, name: string) => {
      expect(screen.getAllByRole("button", { name })).toHaveLength(count);
    });
  });

  Scenario("Abrir el modal para compartir un álbum", ({ Given, When, Then, And }) => {
    Given("la API tiene los álbumes {string} y {string}", givenAlbums);
    When("abro la página de inicio sin sesión", openHome);
    And("pulso compartir en el álbum {string}", openCard);
    Then("veo el diálogo {string}", (_ctx, name: string) => {
      expect(dialogOf(name)).toBeInTheDocument();
    });
    And(
      "el diálogo ofrece Facebook, X (Twitter), WhatsApp, Telegram, Correo y Copiar enlace",
      () => {
        const dialog = dialogOf("Compartir Cody en el espacio");
        for (const name of ["Facebook", "X (Twitter)", "WhatsApp", "Telegram", "Correo"]) {
          expect(within(dialog).getByRole("link", { name })).toBeInTheDocument();
        }
        expect(within(dialog).getByRole("button", { name: "Copiar enlace" })).toBeInTheDocument();
      },
    );
    And("la página sigue en la home", () => {
      expect(window.location.pathname).toBe("/");
    });
  });

  Scenario("Compartir una estampa enlaza a su ancla", ({ Given, When, Then, And }) => {
    Given(
      "la API tiene el álbum {string} con las estampas {string} y {string}",
      (_ctx, title: string, s1: string, s2: string) => {
        vi.mocked(getAlbumStickers).mockResolvedValue({
          album: album(title),
          stickers: [
            { id: "1", number: 1, name: s1 },
            { id: "2", number: 2, name: s2 },
          ],
        });
      },
    );
    When("abro el álbum {string}", async (_ctx, id: string) => {
      await renderAsync(AlbumPage({ params: Promise.resolve({ id }) }));
    });
    And("pulso compartir en la estampa {string}", (_ctx, name: string) => {
      fireEvent.click(screen.getByRole("button", { name: `Compartir ${name}` }));
    });
    Then("el enlace de Telegram contiene la URL {string}", (_ctx, path: string) => {
      const href = screen.getByRole("link", { name: "Telegram" }).getAttribute("href")!;
      expect(new URL(href).searchParams.get("url")).toBe(`${window.location.origin}${path}`);
    });
  });

  Scenario("Copiar el enlace de un álbum", ({ Given, When, Then, And }) => {
    Given("la API tiene los álbumes {string} y {string}", (_ctx, a: string, b: string) => {
      givenAlbums(_ctx, a, b);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
      });
    });
    When("abro la página de inicio sin sesión", openHome);
    And("pulso compartir en el álbum {string}", openCard);
    And("pulso {string}", (_ctx, name: string) => {
      fireEvent.click(screen.getByRole("button", { name }));
    });
    Then("veo el mensaje {string}", async (_ctx, text: string) => {
      await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());
    });
  });
});
