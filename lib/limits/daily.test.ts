import { beforeEach, expect, test, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("AI_DAILY_LIMIT", "2");
});

test("allows the daily limit, then refuses", async () => {
  const { takeDailyRun, remainingRuns } = await import("./daily");
  expect((await takeDailyRun("u1")).remaining).toBe(1);
  expect((await takeDailyRun("u1")).ok).toBe(true);
  const third = await takeDailyRun("u1");
  expect(third.ok).toBe(false);
  expect(third.remaining).toBe(0);
  expect(await remainingRuns("u2")).toBe(2);
});

test("a refund gives the run back", async () => {
  const { takeDailyRun, refundDailyRun, remainingRuns } = await import("./daily");
  await takeDailyRun("u1");
  await refundDailyRun("u1");
  expect(await remainingRuns("u1")).toBe(2);
});

test("resetAt is the next UTC midnight", async () => {
  const { takeDailyRun } = await import("./daily");
  const { resetAt } = await takeDailyRun("u3");
  expect(new Date(resetAt).toISOString()).toMatch(/T00:00:00.000Z$/);
  expect(resetAt).toBeGreaterThan(Date.now());
});
