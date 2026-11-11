import { expect, test } from "vitest";
import ar from "./ar.json";
import en from "./en.json";

function keys(o: unknown, prefix = ""): string[] {
  if (Array.isArray(o)) return o.flatMap((v, i) => keys(v, `${prefix}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

test("en and ar have exactly the same message keys", () => {
  expect(keys(ar).sort()).toEqual(keys(en).sort());
});

test("no message key contains a dot", () => {
  const all = JSON.stringify([en, ar]);
  expect(all).not.toMatch(/"[^"]*\.[^"]*":/);
});
