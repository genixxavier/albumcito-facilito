import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import DashboardPage from "@/app/[username]/page";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";
import { getMe } from "@/lib/api";
import { getSession } from "@/lib/session";

vi.mock("@/lib/api", () => ({ getMe: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));
vi.mock("@/app/actions", () => ({
  loginAction: vi.fn(),
  signupAction: vi.fn(),
  logoutAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const feature = await loadFeature("src/features/auth.feature");

describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterEachScenario }) => {
  let redirected: string | undefined;

  BeforeEachScenario(() => {
    redirected = undefined;
    vi.mocked(getMe).mockReset();
    vi.mocked(getSession).mockReset();
  });
  AfterEachScenario(() => {
    cleanup();
  });

  const openDashboard = async (username: string) => {
    try {
      render((await DashboardPage({ params: Promise.resolve({ username }) })) as ReactNode);
    } catch (e) {
      redirected = String((e as Error).message).replace("NEXT_REDIRECT:", "");
    }
  };

  Scenario("Formulario de registro", ({ When, Then }) => {
    When("abro la página de registro", () => {
      render(<SignupPage />);
    });
    Then(
      "veo los campos {string}, {string} y {string}",
      (_ctx, a: string, b: string, c: string) => {
        for (const label of [a, b, c]) expect(screen.getByLabelText(label)).toBeInTheDocument();
      },
    );
  });

  Scenario("Formulario de inicio de sesión", ({ When, Then, And }) => {
    When("abro la página de inicio de sesión", () => {
      render(<LoginPage />);
    });
    Then("veo los campos {string} y {string}", (_ctx, a: string, b: string) => {
      for (const label of [a, b]) expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
    And("no veo el campo {string}", (_ctx, label: string) => {
      expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    });
  });

  Scenario("Dashboard del usuario autenticado", ({ Given, When, Then }) => {
    Given(
      "una sesión válida del usuario {string} con username {string}",
      (_ctx, name: string, username: string) => {
        vi.mocked(getSession).mockResolvedValue("token");
        vi.mocked(getMe).mockResolvedValue({ id: "1", name, email: "a@b.c", username });
      },
    );
    When("abro el dashboard {string}", (_ctx, username: string) => openDashboard(username));
    Then("veo el saludo {string}", (_ctx, text: string) => {
      expect(screen.getByRole("heading", { name: text })).toBeInTheDocument();
    });
  });

  Scenario("Dashboard sin sesión", ({ Given, When, Then }) => {
    Given("no hay sesión", () => {
      vi.mocked(getSession).mockResolvedValue(undefined);
    });
    When("abro el dashboard {string}", (_ctx, username: string) => openDashboard(username));
    Then("soy redirigido a {string}", (_ctx, url: string) => {
      expect(redirected).toBe(url);
    });
  });
});
