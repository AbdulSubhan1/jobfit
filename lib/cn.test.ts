import { expect, test } from "vitest";
import { cn } from "./cn";

test("joins truthy class names with single spaces", () => {
  expect(cn("a", false, null, undefined, "b")).toBe("a b");
});
