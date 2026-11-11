import { APICallError, streamText } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { AI_TOOLS, LIMITS, type AiTool } from "@/constants/config";
import { getModel } from "@/lib/ai/model";
import { buildPrompt, PROMPTS } from "@/lib/ai/prompts";
import { refundDailyRun, takeDailyRun } from "@/lib/limits/daily";
import { findPersonalData } from "@/lib/privacy/mask";

export const maxDuration = 60;

const Body = z.object({
  job: z.string().trim().min(1).max(LIMITS.jobChars),
  cv: z.string().trim().min(1).max(LIMITS.cvChars),
});

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const isTool = (t: string): t is AiTool => (AI_TOOLS as readonly string[]).includes(t);

// Order matters (AGENTS.md §3): session, validation, daily run, then the model. Bodies are never logged.
export async function POST(req: Request, ctx: RouteContext<"/api/ai/[tool]">) {
  const userId = (await auth())?.user?.id;
  if (!userId) return json({ error: "unauthorized" }, 401);

  const { tool } = await ctx.params;
  if (!isTool(tool)) return json({ error: "not-found" }, 404);

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return json({ error: "invalid" }, 400);
  const { job, cv } = body.data;
  // The browser masks first; this catches a client that didn't. Checked apart so the texts can't join up.
  if (findPersonalData(job).length || findPersonalData(cv).length) return json({ error: "personal-data" }, 400);

  const run = await takeDailyRun(userId);
  if (!run.ok) return json({ error: "limit", resetAt: run.resetAt }, 429);

  const result = streamText({
    model: getModel(),
    system: PROMPTS[tool].system,
    prompt: buildPrompt(tool, job, cv),
    maxRetries: 1,
    abortSignal: req.signal,
    // The SDK's default logs the whole error, and provider errors carry the request body (the CV)
    onError: ({ error }) =>
      console.error(APICallError.isInstance(error) ? `AI provider error ${error.statusCode}` : "AI provider error"),
  });
  const parts = result.stream[Symbol.asyncIterator]();

  // Wait for the first text so a provider failure (e.g. free quota used up) returns an error, not an empty 200
  let first: string | null = null;
  try {
    for (let next = await parts.next(); !next.done; next = await parts.next()) {
      if (next.value.type === "error") break;
      if (next.value.type === "text-delta") {
        first = next.value.text;
        break;
      }
    }
  } catch {
    first = null;
  }
  if (first === null) {
    await refundDailyRun(userId);
    return json({ error: "provider" }, 502);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(first));
    },
    async pull(controller) {
      // Skip non-text parts; stop quietly on a mid-stream error (the user keeps what arrived)
      for (let next = await parts.next(); ; next = await parts.next()) {
        if (next.done || next.value.type === "error") return controller.close();
        if (next.value.type === "text-delta") return controller.enqueue(encoder.encode(next.value.text));
      }
    },
    async cancel() {
      await parts.return?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Runs-Remaining": String(run.remaining),
    },
  });
}
