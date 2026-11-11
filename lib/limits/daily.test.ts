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

test("uses Redis when only the Vercel integration's KV_* names are set", async () => {
  const counts = new Map<string, number>();
  vi.doMock("@upstash/redis", () => ({
    Redis: {
      fromEnv: () => ({
        incr: async (k: string) => counts.set(k, (counts.get(k) ?? 0) + 1).get(k)!,
        decr: async (k: string) => counts.set(k, (counts.get(k) ?? 0) - 1).get(k)!,
        get: async (k: string) => counts.get(k) ?? null,
        expire: async () => 1,
      }),
    },
  }));
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
  vi.stubEnv("KV_REST_API_TOKEN", "test-token");
  const { takeDailyRun } = await import("./daily");
  expect((await takeDailyRun("u4")).ok).toBe(true);
  expect(counts.size).toBe(1);
  vi.doUnmock("@upstash/redis");
});
