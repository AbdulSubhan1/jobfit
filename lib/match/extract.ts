import { SKILLS } from "./skills";

// Lines that state a hard requirement count 1.5x
const REQUIRED = /\b(must|required|requirements?|essential|need|mandatory)\b/i;
const WEIGHT_REQUIRED = 1.5;

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word boundaries that also respect symbols in names like C++, C#, Node.js
const BEFORE = "(?<![A-Za-z0-9+#.])";
const AFTER = "(?![A-Za-z0-9+#])";

const MATCHERS = SKILLS.map((skill) => ({
  id: skill.id,
  patterns: [
    ...skill.aliases.map((a) => new RegExp(`${BEFORE}${escape(a)}${AFTER}`, "i")),
    // Case-sensitive short names: also reject a following hyphen ("Go-getter")
    ...(skill.exact ?? []).map((a) => new RegExp(`${BEFORE}${escape(a)}(?![A-Za-z0-9+#-])`)),
  ],
}));

/** Skill id → weight (1, or 1.5 when it appears on a "must/required" line), in order of first appearance. */
export function extractSkills(text: string): Map<string, number> {
  const found: { id: string; line: number; index: number; weight: number }[] = [];
  text.split(/\r?\n/).forEach((line, lineNo) => {
    const weight = REQUIRED.test(line) ? WEIGHT_REQUIRED : 1;
    for (const { id, patterns } of MATCHERS) {
      const indexes = patterns.map((p) => line.search(p)).filter((i) => i >= 0);
      if (indexes.length) found.push({ id, line: lineNo, index: Math.min(...indexes), weight });
    }
  });

  found.sort((a, b) => a.line - b.line || a.index - b.index);
  const skills = new Map<string, number>();
  for (const f of found) skills.set(f.id, Math.max(skills.get(f.id) ?? 0, f.weight));
  return skills;
}
