import { expect, test } from "vitest";
import { getModel } from "./model";

test.each([
  ["google", "google"],
  ["groq", "groq"],
  ["openai", "openai"],
  ["anthropic", "anthropic"],
  ["ollama", "ollama"],
])("AI_PROVIDER=%s builds a %s model", (provider, expected) => {
  const model = getModel({ AI_PROVIDER: provider, AI_MODEL: "some-model", NODE_ENV: "test" });
  expect(typeof model).toBe("object");
  expect((model as { provider: string }).provider).toContain(expected);
  expect((model as { modelId: string }).modelId).toBe("some-model");
});

test("throws on an unknown provider", () => {
  expect(() => getModel({ AI_PROVIDER: "skynet", AI_MODEL: "x", NODE_ENV: "test" })).toThrow(/AI_PROVIDER/);
});

test("throws when AI_MODEL is missing", () => {
  expect(() => getModel({ AI_PROVIDER: "google", NODE_ENV: "test" })).toThrow(/AI_MODEL/);
});
