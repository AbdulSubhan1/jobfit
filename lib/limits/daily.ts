import { Redis } from "@upstash/redis";
import { LIMITS } from "@/constants/config";

// Each signed-in user gets AI_DAILY_LIMIT runs per UTC day. This counter is the only thing the server stores.

export type DailyRun = { ok: boolean; remaining: number; resetAt: number };

type Counter = {
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  get(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
};

const TWO_DAYS = 172_800;

function memoryCounter(): Counter {
  const counts = new Map<string, number>();
  return {
    incr: async (k) => counts.set(k, (counts.get(k) ?? 0) + 1).get(k)!,
    decr: async (k) => counts.set(k, Math.max(0, (counts.get(k) ?? 0) - 1)).get(k)!,
    get: async (k) => counts.get(k) ?? 0,
    expire: async () => undefined,
  };
}

let counter: Counter | undefined;
function getCounter(): Counter {
  if (counter) return counter;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = Redis.fromEnv();
    counter = {
      incr: (k) => redis.incr(k),
      decr: (k) => redis.decr(k),
      get: async (k) => Number((await redis.get<number>(k)) ?? 0),
      expire: (k, s) => redis.expire(k, s),
    };
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN: the daily limit needs shared storage");
  } else {
    // Local dev only: resets when the server restarts
    counter = memoryCounter();
  }
  return counter;
}

export function dailyLimit() {
  const n = Number(process.env.AI_DAILY_LIMIT);
  return Number.isInteger(n) && n > 0 ? n : LIMITS.dailyAi;
}

function keyFor(userId: string, now = new Date()) {
  return `jobfit:runs:${userId}:${now.toISOString().slice(0, 10)}`;
}

function nextUtcMidnight(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

/** Counts one run. ok is false when the user is over today's limit. */
export async function takeDailyRun(userId: string): Promise<DailyRun> {
  const c = getCounter();
  const key = keyFor(userId);
  const used = await c.incr(key);
  if (used === 1) await c.expire(key, TWO_DAYS);
  const limit = dailyLimit();
  return { ok: used <= limit, remaining: Math.max(0, limit - used), resetAt: nextUtcMidnight() };
}

/** Gives a run back when the AI failed before producing anything. */
export async function refundDailyRun(userId: string): Promise<void> {
  await getCounter().decr(keyFor(userId));
}

export async function remainingRuns(userId: string): Promise<number> {
  return Math.max(0, dailyLimit() - (await getCounter().get(keyFor(userId))));
}
