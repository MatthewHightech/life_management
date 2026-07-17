import { expect, test } from "@playwright/test";

test("sign-in page renders", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(
    page.getByRole("heading", { name: "Your home, made simple and connected." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Demo" })).toBeVisible();
});
