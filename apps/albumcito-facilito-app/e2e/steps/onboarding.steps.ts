import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

When("añado la estampa {string}", async ({ page }, name: string) => {
  await page.getByRole("button", { name: `Añadir ${name}` }).click();
});

When("omito el onboarding", async ({ page }) => {
  await page.getByRole("link", { name: "Omitir por ahora" }).click();
});

When("voy a mi colección", async ({ page }) => {
  await page.getByRole("link", { name: "Ir a mi colección" }).click();
});

Then("veo el encabezado {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("heading", { level: 1, name: text })).toBeVisible();
});

Then("veo la confirmación {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("status")).toContainText(text);
});

Then("veo la estampa {string} en mi colección", async ({ page }, name: string) => {
  await expect(page.getByRole("listitem").filter({ hasText: name })).toBeVisible();
});

Then("veo {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});
