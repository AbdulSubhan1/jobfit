/** Joins class names, skipping falsy parts. There is no class merging: library components use variants instead. */
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
