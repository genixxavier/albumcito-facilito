import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

const API_URL = "http://localhost:3101";
const PASSWORD = "secreto123";

Given("existe un usuario {string} con correo {string}", async ({ request }, name: string, email: string) => {
  const res = await request.post(`${API_URL}/auth/signup`, {
    data: { name, email, password: PASSWORD },
  });
  expect(res.status()).toBe(201);
});

Given("estoy en la página {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

When("abro la página {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

When(
  "me registro con nombre {string}, correo {string} y contraseña {string}",
  async ({ page }, name: string, email: string, password: string) => {
    await page.getByLabel("Nombre").fill(name);
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Registrarme" }).click();
  },
);

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

When("inicio sesión con correo {string} y contraseña {string}", async ({ page }, email: string, password: string) => {
  await login(page, email, password);
});

Given("inicié sesión con correo {string} y contraseña {string}", async ({ page }, email: string, password: string) => {
  await page.goto("/login");
  await login(page, email, password);
  await page.waitForURL((url) => url.pathname !== "/login");
});

When("cierro sesión", async ({ page }) => {
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
});

Then("soy redirigido a {string}", async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`));
});

Then("sigo en {string}", async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`));
});

Then("veo el saludo {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("heading", { name: text })).toBeVisible();
});

Then("veo el error {string}", async ({ page }, text: string) => {
  await expect(page.locator("form [role=alert]")).toHaveText(text);
});

Then("la cookie de sesión es HttpOnly y no es visible desde JavaScript", async ({ page, context }) => {
  const session = (await context.cookies()).find((c) => c.name === "session");
  expect(session?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("session");
});

Then("no hay cookie de sesión", async ({ context }) => {
  expect((await context.cookies()).find((c) => c.name === "session")).toBeUndefined();
});

Then("el campo {string} conserva {string}", async ({ page }, label: string, value: string) => {
  await expect(page.getByLabel(label)).toHaveValue(value);
});
