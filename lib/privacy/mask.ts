// Hides personal data in the browser before any text is sent to the AI, and puts it back afterwards.
// Each distinct value gets a numbered tag ("[EMAIL-1]"); the map from tag to value never leaves the device.
// Every pattern has bounded repetition, so even 27k characters of junk are scanned in linear time.

export type TagKind = "NAME" | "EMAIL" | "PHONE" | "LINK" | "ID" | "ADDRESS" | "HIDDEN";

export type MaskResult = {
  masked: string;
  /** "[EMAIL-1]" → "abdul@example.com" */
  map: Record<string, string>;
};

const TAG = /\[[A-Z]+-\d+\]/g;

const EMAIL =
  /(?<![\w.%+-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){0,6}\.[A-Za-z]{2,24}(?![\w-])/g;

// Anything that starts like a URL is a link, whatever the domain ending
const URL = /(?:https?:\/\/|www\.)[^\s<>"'|,;()[\]]{1,200}/gi;
// Bare domains ("abdul.dev/blog") only with endings people use for personal sites
const TLDS =
  "com|net|org|dev|io|me|co|ai|app|tech|xyz|info|site|page|link|blog|art|design|cc|gg|tv|fm|" +
  "ae|pk|in|uk|sa|qa|kw|bh|om|eg|jo|lb|ma|tr|eu|de|ca|fr|nl|au|us|es|it|ch|se|dk|pl|ie|be|at|pt|br|sg|my|nz|za|ng|ke";
const BARE_LINK = new RegExp(
  `(?<![\\w.@/-])(?:[a-z0-9][a-z0-9-]{0,62}\\.){1,4}(?:${TLDS})(?:\\/[^\\s<>"'|,;()[\\]]{0,200})?(?![\\w-])`,
  "gi",
);
// Library names that look like domains
const NOT_LINKS = new Set(["socket.io", "chart.js", "vue.js", "asp.net", "vb.net", "ado.net"]);
const TRAILING_PUNCTUATION = /[.,!?:]+$/;

const IDS = [
  /\b784-\d{4}-\d{7}-\d\b/g, // Emirates ID
  /\b\d{5}-\d{7}-\d\b/g, // Pakistani CNIC
  /(?<=passport(?:\s{0,3}(?:no\.?|number))?\s{0,3}[:#]?\s{0,3})[A-Z0-9]{6,9}\b/gi,
];

// A run of digits and phone punctuation on one line (never across a line break)
const DIGIT_RUN = /(?<![\w+])[+(]?\d[\d \t().-]{4,40}\d(?!\d)/g;
const PHONE_DIGITS = { min: 9, max: 15 };
const PHONE_LABEL =
  /(?:phone|tel|telephone|mobile|mob|cell|whatsapp|contact|هاتف|جوال|موبايل)\.?\s{0,3}[:#-]?\s{0,3}$/i;
const US_PHONE = /^\d{3}[-. ]\d{3}[-. ]\d{4}$/;
const YEAR = /(?<!\d)(?:19|20)\d{2}(?!\d)/g;

const ADDRESS_WORD =
  /\b(house|street|st\.|road|rd\.|block|sector|apartment|apt|flat|floor|building|villa|p\.?\s?o\.?\s?box|avenue|lane|phase)\b/i;

const HEADINGS = new Set([
  "curriculum vitae",
  "resume",
  "résumé",
  "cv",
  "profile",
  "summary",
  "profile summary",
  "professional summary",
  "about me",
  "objective",
  "career objective",
  "contact",
  "contact information",
  "contact details",
  "personal details",
  "personal information",
  "work experience",
  "experience",
  "education",
  "skills",
]);
const JOB_TITLE =
  /\b(engineer|developer|manager|designer|analyst|consultant|specialist|officer|intern|lead|architect|director|executive|assistant|accountant|scientist|administrator|coordinator|technician|associate|founder|programmer|tester|writer|editor|teacher|nurse|doctor)s?\b/i;
const NAME_LINES_TO_SCAN = 5;

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Applies `replace` only to the parts of `text` that are not already tags. `before` is the text just ahead. */
function outsideTags(text: string, pattern: RegExp, replace: (match: string, before: string) => string) {
  const apply = (segment: string) =>
    segment.replace(pattern, (m: string, ...args: unknown[]) => {
      const offset = args.find((a) => typeof a === "number") as number;
      return replace(m, segment.slice(Math.max(0, offset - 24), offset));
    });
  let out = "";
  let last = 0;
  for (const tag of text.matchAll(TAG)) {
    out += apply(text.slice(last, tag.index)) + tag[0];
    last = tag.index + tag[0].length;
  }
  return out + apply(text.slice(last));
}

function isPhone(candidate: string, before: string) {
  const digits = candidate.replace(/\D/g, "").length;
  if (digits < PHONE_DIGITS.min || digits > PHONE_DIGITS.max) return false;
  // Date ranges such as "(01.2019 - 03.2023)"
  if ((candidate.match(YEAR) ?? []).length >= 2) return false;
  return /^[+0(]/.test(candidate) || US_PHONE.test(candidate) || PHONE_LABEL.test(before);
}

/** Replaces each phone number inside a digit run; a run can hold two numbers side by side. */
function replacePhones(run: string, before: string, tag: (phone: string) => string) {
  if (isPhone(run, before)) return tag(run);
  if (run.replace(/\D/g, "").length <= PHONE_DIGITS.max) return run;
  return run
    .split(/(?<=\d)([ \t]+)(?=[+0(])/)
    .map((part, i) => (i % 2 === 0 && isPhone(part, i === 0 ? before : "") ? tag(part) : part))
    .join("");
}

/** The CV's name: the first of its opening lines that reads like 2–4 capitalised (or Arabic) words. */
function findName(cv: string): string | null {
  const lines = cv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, NAME_LINES_TO_SCAN);
  for (const line of lines) {
    const candidate = line
      .replace(/^name\s{0,3}:\s{0,3}/i, "")
      .split(/\s[-–—]\s|[|•·,–—]/)[0]
      .trim();
    if (!candidate || HEADINGS.has(candidate.toLowerCase()) || JOB_TITLE.test(candidate)) continue;
    if (/[\d@/:]/.test(candidate)) continue;
    const words = candidate.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    const latin = words.every((w) => /^\p{Lu}[\p{L}'.-]*$/u.test(w));
    const arabic = words.every((w) => /^\p{Script=Arabic}+$/u.test(w));
    if (latin || arabic) return candidate;
  }
  return null;
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

/** Tag state shared across texts, so the same value gets the same tag in the CV and the job. */
function createMasker(extraTerms: string[]) {
  const map: Record<string, string> = {};
  const byValue = new Map<string, string>();
  const counts: Partial<Record<TagKind, number>> = {};

  const tagFor = (kind: TagKind, value: string) => {
    const key = `${kind}:${value}`;
    let tag = byValue.get(key);
    if (!tag) {
      counts[kind] = (counts[kind] ?? 0) + 1;
      tag = `[${kind}-${counts[kind]}]`;
      byValue.set(key, tag);
      map[tag] = value;
    }
    return tag;
  };

  const tagLink = (m: string) => {
    const value = m.replace(TRAILING_PUNCTUATION, "");
    return NOT_LINKS.has(value.toLowerCase()) ? m : tagFor("LINK", value) + m.slice(value.length);
  };

  function mask(text: string, name: string | null) {
    // Order matters: emails before links (domains), IDs before phones (digit runs)
    let out = outsideTags(text, EMAIL, (m) => tagFor("EMAIL", m));
    out = outsideTags(out, URL, tagLink);
    out = outsideTags(out, BARE_LINK, tagLink);
    for (const id of IDS) out = outsideTags(out, id, (m) => tagFor("ID", m));
    out = outsideTags(out, DIGIT_RUN, (m, before) => replacePhones(m, before, (p) => tagFor("PHONE", p)));
    for (const line of addressLines(out)) {
      out = outsideTags(out, new RegExp(escape(line), "g"), (m) => tagFor("ADDRESS", m));
    }

    if (name) {
      out = outsideTags(out, new RegExp(escape(name), "g"), (m) => tagFor("NAME", m));
      for (const part of name.split(/\s+/).filter((p) => p.length >= 3)) {
        // Also "ABDUL" and "Abdul" when the CV writes the name another way
        const forms = [...new Set([part, part.toUpperCase(), part[0].toUpperCase() + part.slice(1).toLowerCase()])];
        const pattern = new RegExp(`(?<!\\p{L})(?:${forms.map(escape).join("|")})(?!\\p{L})`, "gu");
        out = outsideTags(out, pattern, (m) => tagFor("NAME", m));
      }
    }

    for (const term of extraTerms.map((t) => t.trim()).filter(Boolean)) {
      out = outsideTags(out, new RegExp(`(?<![\\p{L}\\d])${escape(term)}(?![\\p{L}\\d])`, "giu"), (m) =>
        tagFor("HIDDEN", m),
      );
    }
    return out;
  }

  return { mask, map };
}

export function maskPersonalData(text: string, opts: { extraTerms?: string[] } = {}): MaskResult {
  const masker = createMasker(opts.extraTerms ?? []);
  return { masked: masker.mask(text, findName(text)), map: masker.map };
}

/** Masks the CV and the job with shared tags. The name comes from the CV and is hidden in both. */
export function maskForAi(cv: string, job: string, extraTerms: string[] = []) {
  const masker = createMasker(extraTerms);
  const name = findName(cv);
  return { cv: masker.mask(cv, name), job: masker.mask(job, name), map: masker.map };
}

/** Puts real values back. Tolerates the AI changing a tag's case or spacing; unknown tags stay as they are. */
export function unmask(text: string, map: Record<string, string>): string {
  return text.replace(/\[\s{0,3}([A-Za-z]{1,10})\s{0,3}-\s{0,3}(\d{1,4})\s{0,3}\]/g, (m, kind: string, n: string) => {
    return map[`[${kind.toUpperCase()}-${n}]`] ?? m;
  });
}

/** Server-side check: contact details that should never reach the AI unmasked. */
export function findPersonalData(text: string): TagKind[] {
  const has = (source: string, pattern: RegExp, ok: (m: string, before: string) => boolean) => {
    let hit = false;
    outsideTags(source, pattern, (m, before) => {
      if (!hit && ok(m, before)) hit = true;
      return m;
    });
    return hit;
  };
  const isLink = (m: string) => !NOT_LINKS.has(m.replace(TRAILING_PUNCTUATION, "").toLowerCase());
  const isPhoneRun = (m: string, before: string) => {
    let found = false;
    replacePhones(m, before, (p) => {
      found = true;
      return p;
    });
    return found;
  };

  const kinds: TagKind[] = [];
  if (has(text, EMAIL, () => true)) kinds.push("EMAIL");
  if (has(text, DIGIT_RUN, isPhoneRun)) kinds.push("PHONE");
  // An email's domain is not a separate link
  const withoutEmails = text.replace(EMAIL, "");
  if (has(withoutEmails, URL, isLink) || has(withoutEmails, BARE_LINK, isLink)) kinds.push("LINK");
  return kinds;
}
