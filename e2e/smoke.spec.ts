import { expect, test } from "@playwright/test";

test("the sample shows a score and a saved AI result without signing in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try a sample" }).first().click();
  await expect(page.getByRole("img", { name: "Match score: 69%" })).toBeVisible();
  await expect(page.getByText("Sample result")).toBeVisible();
  await expect(page.locator('[data-ui="StreamText"]')).toContainText("Dear Hiring Team", { timeout: 10_000 });
});

test("your own job and CV get a score, and the AI asks you to sign in", async ({ page }) => {
  await page.goto("/check");
  await page
    .getByLabel("Job description")
    .fill("Must have React, TypeScript and Next.js. Nice to have: GraphQL and AWS.");
  await page.getByRole("button", { name: "Paste text instead" }).click();
  await page.locator("#cv-text").fill("Jane Doe\nReact and TypeScript developer.");
  await page.getByRole("button", { name: "Check match" }).click();
  await expect(page.getByRole("img", { name: /Match score: \d+%/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to use the AI" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("the AI route refuses requests without a session", async ({ request }) => {
  const res = await request.post("/api/ai/cover-letter", { data: { job: "React role", cv: "[NAME-1]" } });
  expect(res.status()).toBe(401);
});

test("Arabic pages render right to left", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "افحص سيرتي" }).first()).toBeVisible();
});
