"use client";

import { useRef, useState } from "react";
import type { AiTool } from "@/constants/config";

export type RunError = {
  code: "unauthorized" | "limit" | "provider" | "personal-data" | "invalid" | "network";
  resetAt?: number;
};

export type Run = {
  /** Masked text as it arrived from the server. Unmask it for display. */
  raw: string;
  map: Record<string, string>;
  status: "idle" | "streaming" | "done" | "error";
  error?: RunError;
};

const IDLE: Run = { raw: "", map: {}, status: "idle" };
const KNOWN_ERRORS = new Set(["unauthorized", "limit", "provider", "personal-data", "invalid"]);

/** Streams one AI tool at a time from /api/ai/[tool]. Holds a run per tool so tabs keep their results. */
export function useAiStream(onRemaining: (n: number) => void) {
  const [runs, setRuns] = useState<Partial<Record<AiTool, Run>>>({});
  const controller = useRef<AbortController | null>(null);

  const update = (tool: AiTool, patch: Partial<Run>) =>
    setRuns((r) => ({ ...r, [tool]: { ...IDLE, ...r[tool], ...patch } }));

  async function start(tool: AiTool, body: { job: string; cv: string }, map: Record<string, string>) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    update(tool, { raw: "", map, status: "streaming", error: undefined });

    try {
      const res = await fetch(`/api/ai/${tool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; resetAt?: number };
        const code = KNOWN_ERRORS.has(data.error ?? "") ? (data.error as RunError["code"]) : "network";
        if (code === "limit") onRemaining(0);
        return update(tool, { status: "error", error: { code, resetAt: data.resetAt } });
      }
      const remaining = Number(res.headers.get("X-Runs-Remaining"));
      if (Number.isFinite(remaining)) onRemaining(remaining);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        raw += decoder.decode(chunk.value, { stream: true });
        update(tool, { raw });
      }
      update(tool, { status: "done" });
    } catch (e) {
      // Stopped by the user: keep what arrived
      if (abort.signal.aborted) return update(tool, { status: "done" });
      update(tool, { status: "error", error: { code: "network" } });
      console.error(e instanceof Error ? e.name : "stream error");
    }
  }

  return { runs, start, stop: () => controller.current?.abort() };
}
