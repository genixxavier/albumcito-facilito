import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import AlbumPage from "@/app/albums/[id]/page";
import Home from "@/app/page";
import {
  getAlbums,
  getAlbumStickers,
  getMyLikes,
  getTopAlbums,
  getTopStickers,
  setAlbumLike,
  type AlbumSummary,
  type TopSticker,
} from "@/lib/api";
import { getSession } from "@/lib/session";

vi.mock("@/lib/api", () => ({
  getAlbums: vi.fn(),
  getAlbumStickers: vi.fn(),
  getTopAlbums: vi.fn(),
  getTopStickers: vi.fn(),
  getMyLikes: vi.fn(),
  setAlbumLike: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url });
  }),
}));
// Por defecto el botón usa una acción simulada; el escenario anónimo importa la real.
vi.mock("@/app/actions", () => ({ toggleLikeAction: vi.fn() }));

const feature = await loadFeature("src/features/home.feature");

const ALBUMS: Record<string, { id: string }> = {
  "Las aventuras de Cody": { id: "cody-aventuras" },
  "Cody en el espacio": { id: "cody-espacio" },
  "Cody programador": { id: "cody-programador" },
};

function summary(title: string, stickerCount = 0, likeCount = 0): AlbumSummary {
  return { id: ALBUMS[title].id, title, description: "", stickerCount, likeCount };
}

function topSticker(name: string, index: number): TopSticker {
  return { id: `s-${index}`, number: index, name, albumId: "cody-espacio", collectorCount: 3 - index };
}

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  BeforeEachScenario(() => {
    for (const fn of [getAlbums, getAlbumStickers, getTopAlbums, getTopStickers, getMyLikes, setAlbumLike]) {
      vi.mocked(fn).mockReset();
    }
    vi.mocked(getSession).mockReset().mockResolvedValue(undefined);
    vi.mocked(getAlbums).mockResolvedValue([
      summary("Las aventuras de Cody"),
      summary("Cody en el espacio"),
    ]);
    vi.mocked(getTopAlbums).mockResolvedValue([]);
    vi.mocked(getTopStickers).mockResolvedValue([]);
  });
  AfterEachScenario(() => {
    cleanup();
  });

  const renderAsync = async (page: Promise<ReactNode>) => {
    render(await page);
  };
  const openHome = async () => {
    await renderAsync(Home());
  };
  const section = (name: string) => screen.queryByRole("region", { name });

  Scenario("Ver el listado de álbumes", ({ Given, When, Then, And }) => {
    Given("la API tiene los álbumes {string} y {string}", (_ctx, a: string, b: string) => {
      vi.mocked(getAlbums).mockResolvedValue([summary(a), summary(b)]);
    });
    When("abro la página de inicio", openHome);
    Then("veo el encabezado {string}", (_ctx, title: string) => {
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    });
    And("veo {number} álbumes", (_ctx, count: number) => {
      expect(within(screen.getByRole("list", { name: "Álbumes" })).getAllByRole("link")).toHaveLength(count);
    });
    And("el álbum {string} enlaza a {string}", (_ctx, title: string, href: string) => {
      expect(screen.getByRole("link", { name: new RegExp(title) })).toHaveAttribute("href", href);
    });
  });

  Scenario("Ver las estampas de un álbum", ({ Given, When, Then, And }) => {
    Given(
      "la API tiene el álbum {string} con las estampas {string} y {string}",
      (_ctx, title: string, s1: string, s2: string) => {
        vi.mocked(getAlbumStickers).mockResolvedValue({
          album: summary(title, 2),
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
    Then("veo el encabezado {string}", (_ctx, title: string) => {
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    });
    And("veo {number} estampas", (_ctx, count: number) => {
      expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(count);
    });
    And("veo la estampa {string}", (_ctx, name: string) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  Scenario("Abrir un álbum que no existe", ({ Given, When, Then }) => {
    let result: Promise<unknown>;

    Given("la API no tiene el álbum {string}", () => {
      vi.mocked(getAlbumStickers).mockResolvedValue(null);
    });
    When("abro el álbum {string}", (_ctx, id: string) => {
      result = AlbumPage({ params: Promise.resolve({ id }) }).catch((e: unknown) => e);
    });
    Then("se muestra la página de no encontrado", async () => {
      // notFound() lanza un error con digest NEXT_HTTP_ERROR_FALLBACK;404
      expect(await result).toMatchObject({ digest: expect.stringContaining("404") });
    });
  });

  Scenario("Un visitante anónimo ve los rankings", ({ Given, When, Then, And }) => {
    Given("la API tiene las estampas top {string} y {string}", (_ctx, a: string, b: string) => {
      vi.mocked(getTopStickers).mockResolvedValue([topSticker(a, 1), topSticker(b, 2)]);
    });
    And("la API tiene los álbumes más gustados {string} y {string}", (_ctx, a: string, b: string) => {
      vi.mocked(getTopAlbums).mockResolvedValue([summary(a, 3, 2), summary(b, 5, 1)]);
    });
    When("abro la página de inicio", openHome);
    Then("veo la sección {string} con {number} elementos", (_ctx, name: string, count: number) => {
      expect(within(section(name)!).getAllByRole("listitem")).toHaveLength(count);
    });
    And("veo la sección {string} con {number} elementos", (_ctx, name: string, count: number) => {
      expect(within(section(name)!).getAllByRole("listitem")).toHaveLength(count);
    });
    And("la primera estampa top es {string}", (_ctx, name: string) => {
      expect(within(section("Estampas top")!).getAllByRole("listitem")[0]).toHaveTextContent(name);
    });
    And("el primer álbum más gustado es {string}", (_ctx, title: string) => {
      expect(within(section("Álbumes más gustados")!).getAllByRole("listitem")[0]).toHaveTextContent(title);
    });
  });

  Scenario("Los rankings vacíos no se muestran", ({ Given, When, Then, And }) => {
    Given("la API no tiene rankings", () => {
      vi.mocked(getTopAlbums).mockResolvedValue([]);
      vi.mocked(getTopStickers).mockResolvedValue([]);
    });
    When("abro la página de inicio", openHome);
    Then("no veo la sección {string}", (_ctx, name: string) => {
      expect(section(name)).not.toBeInTheDocument();
    });
    And("no veo la sección {string}", (_ctx, name: string) => {
      expect(section(name)).not.toBeInTheDocument();
    });
    And("veo {number} álbumes", (_ctx, count: number) => {
      expect(within(screen.getByRole("list", { name: "Álbumes" })).getAllByRole("link")).toHaveLength(count);
    });
  });

  Scenario("Falla el ranking pero el listado sigue visible", ({ Given, When, Then, And }) => {
    Given("la API falla al cargar los rankings", () => {
      vi.mocked(getTopAlbums).mockRejectedValue(new Error("boom"));
      vi.mocked(getTopStickers).mockRejectedValue(new Error("boom"));
    });
    When("abro la página de inicio", openHome);
    Then("no veo la sección {string}", (_ctx, name: string) => {
      expect(section(name)).not.toBeInTheDocument();
    });
    And("veo {number} álbumes", (_ctx, count: number) => {
      expect(within(screen.getByRole("list", { name: "Álbumes" })).getAllByRole("link")).toHaveLength(count);
    });
  });

  Scenario("Un usuario autenticado da like desde la home", ({ Given, When, Then, And }) => {
    Given("soy un usuario autenticado que no ha dado like a {string}", () => {
      vi.mocked(getSession).mockResolvedValue("token");
      vi.mocked(getMyLikes).mockResolvedValue([]);
    });
    When("abro la página de inicio", openHome);
    And("activo el me gusta de {string}", async (_ctx, title: string) => {
      const card = screen.getByRole("link", { name: new RegExp(title) }).closest("li")!;
      fireEvent.click(within(card).getByRole("button", { name: "Me gusta" }));
    });
    Then("el me gusta de {string} está activo", async (_ctx, title: string) => {
      const card = screen.getByRole("link", { name: new RegExp(title) }).closest("li")!;
      await waitFor(() =>
        expect(within(card).getByRole("button", { name: "Quitar me gusta" })).toHaveAttribute(
          "aria-pressed",
          "true",
        ),
      );
    });
    And("se pidió dar like al álbum {string}", async (_ctx, id: string) => {
      const { toggleLikeAction } = await import("@/app/actions");
      expect(toggleLikeAction).toHaveBeenCalledTimes(1);
      const data = vi.mocked(toggleLikeAction).mock.calls[0][0];
      expect(data.get("albumId")).toBe(id);
      expect(data.get("like")).toBe("true");
    });
  });

  Scenario(
    "Un usuario autenticado ve activo el like de un álbum que ya le gusta",
    ({ Given, When, Then }) => {
      Given("soy un usuario autenticado al que le gusta {string}", () => {
        vi.mocked(getSession).mockResolvedValue("token");
        vi.mocked(getMyLikes).mockResolvedValue(["cody-espacio"]);
      });
      When("abro la página de inicio", openHome);
      Then("el me gusta de {string} está activo", (_ctx, title: string) => {
        const card = screen.getByRole("link", { name: new RegExp(title) }).closest("li")!;
        expect(within(card).getByRole("button", { name: "Quitar me gusta" })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
      });
    },
  );

  Scenario("Un visitante anónimo intenta dar like", ({ Given, When, Then, And }) => {
    let error: unknown;

    Given("soy un visitante sin sesión", () => {
      vi.mocked(getSession).mockResolvedValue(undefined);
    });
    When("intento dar like al álbum {string}", async (_ctx, id: string) => {
      const actual = await vi.importActual<typeof import("@/app/actions")>("@/app/actions");
      const data = new FormData();
      data.set("albumId", id);
      data.set("like", "true");
      error = await actual.toggleLikeAction(data).catch((e: unknown) => e);
    });
    Then("soy redirigido a {string}", async (_ctx, url: string) => {
      const { redirect } = await import("next/navigation");
      expect(redirect).toHaveBeenCalledWith(url);
      expect(error).toMatchObject({ url });
    });
    And("no se registra ningún like", () => {
      expect(setAlbumLike).not.toHaveBeenCalled();
    });
  });
});
