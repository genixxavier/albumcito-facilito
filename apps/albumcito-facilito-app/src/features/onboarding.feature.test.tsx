import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import OnboardingPage from "@/app/onboarding/page";
import { getAlbums, getAlbumStickers, getMe, type PublicUser } from "@/lib/api";
import { getSession } from "@/lib/session";

vi.mock("@/lib/api", () => ({ getMe: vi.fn(), getAlbums: vi.fn(), getAlbumStickers: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));
vi.mock("@/app/actions", () => ({ addStickerAction: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const feature = await loadFeature("src/features/onboarding.feature");

const user = (onboarding: boolean | null): PublicUser => ({
  id: "1",
  name: "Ana Pérez",
  email: "a@b.c",
  username: "ana-perez",
  onboarding,
});

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let redirected: string | undefined;

  BeforeEachScenario(() => {
    redirected = undefined;
    for (const fn of [getMe, getSession, getAlbums, getAlbumStickers]) vi.mocked(fn).mockReset();
  });
  AfterEachScenario(() => {
    cleanup();
  });

  const openOnboarding = async () => {
    try {
      render((await OnboardingPage()) as ReactNode);
    } catch (e) {
      redirected = String((e as Error).message).replace("NEXT_REDIRECT:", "");
    }
  };

  Scenario("Cuenta nueva ve el onboarding", ({ Given, When, Then, And }) => {
    Given("una sesión válida con el onboarding pendiente", () => {
      vi.mocked(getSession).mockResolvedValue("token");
      vi.mocked(getMe).mockResolvedValue(user(false));
    });
    And(
      "la API tiene el álbum {string} con las estampas {string} y {string}",
      (_ctx, title: string, s1: string, s2: string) => {
        const album = { id: "cody-espacio", title, description: "", stickerCount: 2, likeCount: 0 };
        vi.mocked(getAlbums).mockResolvedValue([album]);
        vi.mocked(getAlbumStickers).mockResolvedValue({
          album,
          stickers: [
            { id: "espacio-1", number: 1, name: s1 },
            { id: "espacio-2", number: 2, name: s2 },
          ],
        });
      },
    );
    When("abro el onboarding", openOnboarding);
    Then("veo el encabezado {string}", (_ctx, title: string) => {
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    });
    And("veo {number} estampas para añadir", (_ctx, count: number) => {
      expect(screen.getAllByRole("button", { name: /^Añadir / })).toHaveLength(count);
    });
    And("veo el enlace {string}", (_ctx, name: string) => {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", "/ana-perez");
    });
  });

  Scenario("Cuenta que ya completó el onboarding va al dashboard", ({ Given, When, Then }) => {
    Given("una sesión válida con el onboarding completado", () => {
      vi.mocked(getSession).mockResolvedValue("token");
      vi.mocked(getMe).mockResolvedValue(user(true));
    });
    When("abro el onboarding", openOnboarding);
    Then("soy redirigido a {string}", (_ctx, url: string) => {
      expect(redirected).toBe(url);
    });
  });

  Scenario("Onboarding sin sesión", ({ Given, When, Then }) => {
    Given("no hay sesión", () => {
      vi.mocked(getSession).mockResolvedValue(undefined);
    });
    When("abro el onboarding", openOnboarding);
    Then("soy redirigido a {string}", (_ctx, url: string) => {
      expect(redirected).toBe(url);
    });
  });
});
