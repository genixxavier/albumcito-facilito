import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import AlbumPage from "@/app/albums/[id]/page";
import Home from "@/app/page";
import { getAlbums, getAlbumStickers, type AlbumSummary } from "@/lib/api";

vi.mock("@/lib/api", () => ({ getAlbums: vi.fn(), getAlbumStickers: vi.fn() }));

const feature = await loadFeature("src/features/home.feature");

const ALBUMS: Record<string, { id: string }> = {
  "Las aventuras de Cody": { id: "cody-aventuras" },
  "Cody en el espacio": { id: "cody-espacio" },
};

function summary(title: string, stickerCount = 0): AlbumSummary {
  return { id: ALBUMS[title].id, title, description: "", stickerCount };
}

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  BeforeEachScenario(() => {
    vi.mocked(getAlbums).mockReset();
    vi.mocked(getAlbumStickers).mockReset();
  });
  AfterEachScenario(() => {
    cleanup();
  });

  const renderAsync = async (page: Promise<ReactNode>) => {
    render(await page);
  };

  Scenario("Ver el listado de álbumes", ({ Given, When, Then, And }) => {
    Given("la API tiene los álbumes {string} y {string}", (_ctx, a: string, b: string) => {
      vi.mocked(getAlbums).mockResolvedValue([summary(a), summary(b)]);
    });
    When("abro la página de inicio", async () => {
      await renderAsync(Home());
    });
    Then("veo el encabezado {string}", (_ctx, title: string) => {
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    });
    And("veo {number} álbumes", (_ctx, count: number) => {
      expect(within(screen.getByRole("list")).getAllByRole("link")).toHaveLength(count);
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
});
