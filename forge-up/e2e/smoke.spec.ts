import { test, expect } from "@playwright/test";

test("onboarding persists and home shows progress", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByLabel("Name").fill("Alex");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Cigarettes per day").locator("..").locator("input").fill("10");
  await page.getByText("Price per cigarette").locator("..").locator("input").fill("15");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Quit today" }).click();
  await page.getByRole("button", { name: "Start tracking" }).click();
  await expect(page.getByRole("heading", { name: "Your progress" })).toBeVisible();
  await expect(page.getByText("Change")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Hi, Alex")).toBeVisible();
});
