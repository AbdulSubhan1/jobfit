import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { auth } from "@/auth";
import { getModel } from "@/lib/ai/model";
import { refundDailyRun, takeDailyRun } from "@/lib/limits/daily";
import { POST } from "./route";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/ai/model", () => ({ getModel: vi.fn() }));
vi.mock("@/lib/limits/daily", () => ({ takeDailyRun: vi.fn(), refundDailyRun: vi.fn() }));

const usage = {
  inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 4, text: 4, reasoning: undefined },
};

function streamingModel(deltas: string[]) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start" as const, id: "t" },
          ...deltas.map((delta) => ({ type: "text-delta" as const, id: "t", delta })),
          { type: "text-end" as const, id: "t" },
          { type: "finish" as const, finishReason: { unified: "stop" as const, raw: undefined }, usage },
        ],
      }),
    }),
  });
}

const failingModel = () =>
  new MockLanguageModelV4({
    doStream: async () => {
      throw new Error("quota exhausted");
    },
  });

const JOB = "Senior React engineer. Must have TypeScript and Next.js.";
const CV = "[NAME-1]\n[EMAIL-1]\nBuilt React apps for 5 years.";

function call(tool: string, body: unknown) {
  const req = new Request(`http://localhost/api/ai/${tool}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req, { params: Promise.resolve({ tool }) });
}

const signedIn = () => vi.mocked(auth).mockResolvedValue({ user: { id: "github:42" }, expires: "" } as never);

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(takeDailyRun).mockResolvedValue({ ok: true, remaining: 4, resetAt: 1_800_000_000_000 });
  vi.mocked(getModel).mockReturnValue(streamingModel(["Dear ", "[NAME-1]", ", hello"]));
});

describe("POST /api/ai/[tool]", () => {
  test("rejects a request without a session and never calls the model", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await call("cover-letter", { job: JOB, cv: CV });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
    expect(getModel).not.toHaveBeenCalled();
    expect(takeDailyRun).not.toHaveBeenCalled();
  });

  test("rejects a session without a user id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {}, expires: "" } as never);
    expect((await call("cover-letter", { job: JOB, cv: CV })).status).toBe(401);
  });

  test("404s an unknown tool", async () => {
    signedIn();
    expect((await call("poem", { job: JOB, cv: CV })).status).toBe(404);
  });

  test("400s a body over the size caps", async () => {
    signedIn();
    const res = await call("bullets", { job: "x".repeat(12_001), cv: CV });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid" });
  });

  test("400s a body that is not JSON", async () => {
    signedIn();
    const req = new Request("http://localhost/api/ai/bullets", { method: "POST", body: "not json" });
    expect((await POST(req, { params: Promise.resolve({ tool: "bullets" }) })).status).toBe(400);
  });

  test("400s unmasked personal data and does not count a run", async () => {
    signedIn();
    const res = await call("bullets", { job: JOB, cv: "Reach me at sara@example.com" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "personal-data" });
    expect(takeDailyRun).not.toHaveBeenCalled();
  });

  test("429s when the daily limit is used up", async () => {
    signedIn();
    vi.mocked(takeDailyRun).mockResolvedValue({ ok: false, remaining: 0, resetAt: 1_800_000_000_000 });
    const res = await call("interview", { job: JOB, cv: CV });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "limit", resetAt: 1_800_000_000_000 });
    expect(getModel).not.toHaveBeenCalled();
  });

  test("streams the model's text with the runs left", async () => {
    signedIn();
    const res = await call("cover-letter", { job: JOB, cv: CV });
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Runs-Remaining")).toBe("4");
    expect(await res.text()).toBe("Dear [NAME-1], hello");
    expect(takeDailyRun).toHaveBeenCalledWith("github:42");
  });

  test("502s and refunds the run when the provider fails before any text", async () => {
    signedIn();
    vi.mocked(getModel).mockReturnValue(failingModel());
    const res = await call("cover-letter", { job: JOB, cv: CV });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "provider" });
    expect(refundDailyRun).toHaveBeenCalledWith("github:42");
  });
});
