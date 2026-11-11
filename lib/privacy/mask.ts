// Hides personal data in the browser before any text is sent to the AI, and puts it back afterwards.
// Each distinct value gets a numbered tag ("[EMAIL-1]"); the map from tag to value never leaves the device.

export type TagKind = "NAME" | "EMAIL" | "PHONE" | "LINK" | "ID" | "ADDRESS" | "HIDDEN";

export type MaskResult = {
  masked: string;
  /** "[EMAIL-1]" → "abdul@example.com" */
  map: Record<string, string>;
  /** Kinds found, in the order first seen. */
  found: TagKind[];
};

const TAG = /\[[A-Z]+-\d+\]/g;

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// Lower-case on purpose: CV links are typed in lower case, while names like ASP.NET are not
const LINK =
  /(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+(?:com|dev|io|me|net|org|co|ae|pk|in|uk|sa|qa|app|ai|tech|xyz|info|site|page|link|so|blog|art|design)(?:\/[^\s|,;)]*)?/g;
// Library names that look like domains
const NOT_LINKS = new Set(["socket.io", "chart.js", "vue.js"]);

const IDS = [
  /\b784-\d{4}-\d{7}-\d\b/g, // Emirates ID
  /\b\d{5}-\d{7}-\d\b/g, // Pakistani CNIC
  /(?<=passport(?:\s*(?:no\.?|number))?\s*[:#]?\s*)[A-Z0-9]{6,9}\b/gi,
];

// Starts with +, 0 or ( so years and counts ("2019-2023", "40,000") never qualify
const PHONE = /(?<![\w+])(?:\+|0|\()[\d\s().-]{6,}\d/g;
const PHONE_DIGITS = { min: 9, max: 15 };

const ADDRESS_WORD =
  /\b(house|street|st\.|road|rd\.|block|sector|apartment|apt|flat|floor|building|villa|p\.?\s?o\.?\s?box|avenue|lane|phase)\b/i;

const NOT_NAMES = new Set(["resume", "résumé", "cv", "curriculum", "vitae", "profile", "contact"]);

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Applies `replace` only to the parts of `text` that are not already tags. */
function outsideTags(text: string, pattern: RegExp, replace: (match: string) => string) {
  let out = "";
  let last = 0;
  for (const tag of text.matchAll(TAG)) {
    out += text.slice(last, tag.index).replace(pattern, replace) + tag[0];
    last = tag.index + tag[0].length;
  }
  return out + text.slice(last).replace(pattern, replace);
}

function phoneDigits(s: string) {
  return s.replace(/\D/g, "").length;
}

function isPhone(s: string) {
  const n = phoneDigits(s);
  return n >= PHONE_DIGITS.min && n <= PHONE_DIGITS.max;
}

/** The CV's name line: the first line that reads like 2–4 capitalised words. */
function findName(text: string): string | null {
  const first = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l && !NOT_NAMES.has(l.toLowerCase()));
  if (!first || /[\d@/|:]/.test(first)) return null;
  const words = first.split(/\s+/);
  if (words.length < 2 || words.length > 4) return null;
  return words.every((w) => /^\p{Lu}[\p{L}'.-]*$/u.test(w)) ? first : null;
}

function addressLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length < 140 &&
        !/^[•\-*–]/.test(l) &&
        ADDRESS_WORD.test(l) &&
        /\d/.test(l) &&
        (l.match(/,/g) ?? []).length >= 2,
    );
}

export function maskPersonalData(text: string, opts: { extraTerms?: string[] } = {}): MaskResult {
  const map: Record<string, string> = {};
  const byValue = new Map<string, string>();
  const counts: Partial<Record<TagKind, number>> = {};
  const found: TagKind[] = [];

  const tagFor = (kind: TagKind, value: string) => {
    const key = `${kind}:${value}`;
    let tag = byValue.get(key);
    if (!tag) {
      counts[kind] = (counts[kind] ?? 0) + 1;
      tag = `[${kind}-${counts[kind]}]`;
      byValue.set(key, tag);
      map[tag] = value;
      if (!found.includes(kind)) found.push(kind);
    }
    return tag;
  };

  // Order matters: emails before links (domains), IDs before phones (digit runs)
  let out = outsideTags(text, EMAIL, (m) => tagFor("EMAIL", m));
  out = outsideTags(out, LINK, (m) => (NOT_LINKS.has(m) ? m : tagFor("LINK", m)));
  for (const id of IDS) out = outsideTags(out, id, (m) => tagFor("ID", m));
  out = outsideTags(out, PHONE, (m) => {
    // The match may swallow a trailing space or bracket; tag only the number itself
    const trimmed = m.replace(/[\s.-]+$/, "");
    return isPhone(trimmed) ? tagFor("PHONE", trimmed) + m.slice(trimmed.length) : m;
  });
  for (const line of addressLines(out)) {
    out = outsideTags(out, new RegExp(escape(line), "g"), (m) => tagFor("ADDRESS", m));
  }

  const name = findName(text);
  if (name) {
    out = outsideTags(out, new RegExp(escape(name), "g"), (m) => tagFor("NAME", m));
    for (const part of name.split(/\s+/).filter((p) => p.length >= 3)) {
      out = outsideTags(out, new RegExp(`(?<![\\p{L}])${escape(part)}(?![\\p{L}])`, "gu"), (m) => tagFor("NAME", m));
    }
  }

  for (const term of (opts.extraTerms ?? []).map((t) => t.trim()).filter(Boolean)) {
    out = outsideTags(out, new RegExp(`(?<![\\p{L}\\d])${escape(term)}(?![\\p{L}\\d])`, "giu"), (m) =>
      tagFor("HIDDEN", m),
    );
  }

  return { masked: out, map, found };
}

/** Puts real values back. Tolerates the AI changing a tag's case or spacing; unknown tags stay as they are. */
export function unmask(text: string, map: Record<string, string>): string {
  return text.replace(/\[\s*([A-Za-z]+)\s*-\s*(\d+)\s*\]/g, (m, kind: string, n: string) => {
    return map[`[${kind.toUpperCase()}-${n}]`] ?? m;
  });
}

/** Server-side check: contact details that should never reach the AI unmasked. */
export function findPersonalData(text: string): TagKind[] {
  const has = (source: string, pattern: RegExp, ok: (m: string) => boolean) => {
    let hit = false;
    outsideTags(source, pattern, (m) => {
      if (ok(m)) hit = true;
      return m;
    });
    return hit;
  };
  const kinds: TagKind[] = [];
  if (has(text, EMAIL, () => true)) kinds.push("EMAIL");
  if (has(text, PHONE, (m) => isPhone(m.replace(/[\s.-]+$/, "")))) kinds.push("PHONE");
  // An email's domain is not a separate link
  if (has(text.replace(EMAIL, ""), LINK, (m) => !NOT_LINKS.has(m))) kinds.push("LINK");
  return kinds;
}
