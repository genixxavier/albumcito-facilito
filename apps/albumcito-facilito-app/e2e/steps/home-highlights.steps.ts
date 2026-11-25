import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

When("doy me gusta al álbum {string}", async ({ page }, title: string) => {
  await page
    .getByRole("list", { name: "Álbumes", exact: true })
    .getByRole("listitem")
    .filter({ hasText: title })
    .getByRole("button", { name: "Me gusta" })
    .click();
});

Then("veo en la sección {string} el álbum {string}", async ({ page }, section: string, title: string) => {
  await expect(
    page.getByRole("region", { name: section }).getByRole("listitem").filter({ hasText: title }),
  ).toBeVisible();
});
