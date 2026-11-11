# JobFit MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A free web app that scores a CV against a job in the browser and, for signed-in users, streams AI-written CV bullets, a cover letter and interview questions from masked text.

**Architecture:** Next.js App Router. Matching, PDF parsing and masking run in the browser (`lib/match`, `lib/pdf`, `lib/privacy`). One streaming route `app/api/ai/[tool]` checks the Auth.js session, validates, counts a per-user daily limit in Upstash, and streams from a provider chosen by env. All UI comes from `components/ui`, which reads tokens from `app/globals.css`.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind v4, `ai` + `@ai-sdk/{google,groq,openai,anthropic}` + `ollama-ai-provider-v2`, `next-auth@5.0.0-beta.32`, `@upstash/redis`, `pdfjs-dist`, `next-intl`, `zod`, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-11-jobfit-design.md`

## Global Constraints

- Coding standard: `AGENTS.md` (adapted from PolicyDesk). Raw `button/input/textarea/a/img/svg` and `style={}` only inside `components/ui`; no UI kits, `clsx` or `tailwind-merge`.
- Colours, fonts, radii, shadows only as `@theme` tokens: `mint #d7f5e6`, `ink #0f1f3d`, `pop #ff5c8a`, `sun #ffd23f`, `have #bdeccf`, `miss #ffd1dc`, `card #ffffff`.
- Fonts: Syne (`font-display`), DM Sans (`font-sans`, all numbers with `tabular-nums`), JetBrains Mono (`font-mono`).
- Mobile-first Tailwind (no `max-*` variants); RTL-safe classes only (`ms-/me-/ps-/pe-/text-start/text-end`).
- Every user-facing string in `messages/en.json` (Arabic `ar.json` added in Task 9 with the same keys).
- Secrets only in server env. `.env*` is git-ignored; `.env.example` lists names only.
- Motion is disabled under `prefers-reduced-motion: reduce`.
- `AI_DAILY_LIMIT` default `5`. Input caps: job ≤ 12,000 chars, CV ≤ 15,000 chars, PDF ≤ 5 MB.

## Review Focus

1. A scanned (image-only) PDF yields no text → show "We couldn't read text from this PDF" and open the paste-text fallback (Task 6 test).
2. A job description with no known skills → "Not enough skills found to score" state, never `0%` or `NaN` (Task 3 test).
3. The AI changes a tag's form (`[email-1]`, `[ EMAIL-1 ]`) or a tag arrives split across chunks → unmask is case/space tolerant and runs on the whole accumulated text (Task 4 test).
4. Phone-like numbers that aren't phones (`2019-2023`, `5+ years`, `40,000 users`) stay unmasked while `+971 50 123 4567`, `0300-1234567`, `(021) 3456 7890` are masked (Task 4 test).
5. The provider fails or its free quota is exhausted → friendly error, and the user's daily count is refunded (Task 7 test).

---

### Task 1: Scaffold and project standard

**Files:**
- Create via `create-next-app`: `app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- Create: `AGENTS.md`, `CLAUDE.md`, `.prettierrc`, `eslint.config.mjs`, `vitest.config.ts`, `.env.example`, `lib/cn.ts`

**Interfaces:**
- Produces: `cn(...parts: (string | false | null | undefined)[]): string`; scripts `dev`, `build`, `lint`, `typecheck`, `format`, `test`, `ui:usage`, `check`, `test:e2e`.

- [ ] **Step 1:** `npx create-next-app@latest jobfit --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm` into the existing repo folder (keep `docs/`).
- [ ] **Step 2:** Copy PolicyDesk's `eslint.config.mjs` rules (restricted imports, no inline style, no raw elements outside `components/ui`), `.prettierrc` (printWidth 120, tailwind plugin, `tailwindStylesheet: ./app/globals.css`).
- [ ] **Step 3:** Write `AGENTS.md` from PolicyDesk's, adapted: no database/server actions sections; allowed API routes = Auth.js handler and `app/api/ai/*` streaming; privacy rules (mask in browser, never log request bodies).
- [ ] **Step 4:** Vitest (`environment: "node"`, alias `@`), a trivial `lib/cn.test.ts` (`cn("a", false, "b") === "a b"`).
- [ ] **Step 5:** Run `npm run check && npm test` → both pass. Commit `chore: scaffold Next.js app with coding standard`.

### Task 2: Design tokens and UI library

**Files:**
- Modify: `app/globals.css` (`@theme` tokens, keyframes `pop-in`, `float`, `wobble`, `scan`, `caret`, reduced-motion block), `app/layout.tsx` (fonts via `next/font/google`, `NextIntlClientProvider`)
- Create: `components/ui/{styles.ts,index.ts,registry.ts,usage.json}`, one file each: `button.tsx`, `button-link.tsx`, `card.tsx`, `chip.tsx`, `sticker.tsx`, `icon.tsx`, `textarea.tsx`, `file-drop.tsx`, `score-ring.tsx`, `number-ticker.tsx`, `tabs.tsx`, `stream-text.tsx`, `dialog.tsx`, `scan-bar.tsx`, `confetti.tsx`, `alert.tsx`, `section-heading.tsx`
- Create: `components/design-system/demos.tsx`, `app/design/page.tsx`, `scripts/ui-usage.ts`, `i18n/request.ts`, `messages/en.json`

**Interfaces:**
- Produces (all from `@/components/ui`):
  - `Button({variant?: "primary" | "secondary" | "ghost", size?: "sm" | "md" | "lg"})`, `ButtonLink({href, variant?, size?})`
  - `Card({tone?: "white" | "mint", float?: boolean, sticker?: ReactNode})`
  - `Chip({tone: "have" | "miss" | "neutral", onClick?})`, `Sticker({tone?: "sun" | "pop"})`
  - `Icon({name: IconName, size?: number})` with names `arrow-right, upload, file, lock, sparkle, copy, download, refresh, eye, check, x, github, google, logout`
  - `Textarea`, `FileDrop({accept, maxBytes, onFile(file: File), busy?: boolean})`
  - `ScoreRing({value: number | null, size?: number})` (null = "can't score"), `NumberTicker({value: number, suffix?})`
  - `Tabs({items: {id, label}[], value, onChange})`, `StreamText({text, streaming: boolean})`
  - `Dialog({open, onClose, title})`, `ScanBar`, `Confetti({fire: boolean})`, `Alert({tone: "info" | "error"})`, `SectionHeading`
  - Every root has `data-ui="<Name>"`; every component has a `registry.ts` entry and a demo on `/design`.

- [ ] **Step 1:** Tokens and fonts in `globals.css`/`layout.tsx`.
- [ ] **Step 2:** Components + registry + demos page.
- [ ] **Step 3:** `npm run ui:usage && npm run check` → pass. Look at `/design` in the browser (both widths 375 and 1280).
- [ ] **Step 4:** Commit `feat(ui): design tokens and UI library with /design showcase`.

### Task 3: Skill matching

**Files:**
- Create: `lib/match/skills.ts`, `lib/match/extract.ts`, `lib/match/score.ts`
- Test: `lib/match/score.test.ts`

**Interfaces:**
- Produces: `type Skill = { id: string; label: string; aliases: string[] }`; `SKILLS: Skill[]`; `extractSkills(text: string): Map<string, number>` (skill id → weight 1 or 1.5); `matchCv(job: string, cv: string): MatchResult` where `MatchResult = { score: number | null; have: string[]; missing: string[]; jobSkillCount: number }` (labels, `score` integer 0–100, `null` when the job has fewer than 3 skills).

- [ ] **Step 1: Failing tests**
  - `matchCv` with job "Must have React, Next.js and TypeScript.\nNice to have: GraphQL, AWS" and CV "Built apps in React, NextJS, TS" → `have` = `["React","Next.js","TypeScript"]`, `missing` = `["GraphQL","AWS"]`, `score` = 69 (`4.5 / 6.5` weighted, rounded).
  - Aliases: `k8s` → Kubernetes, `JS` → JavaScript, `node` → Node.js; `Java` does not match inside `JavaScript`; `Go` does not match the word "go" in lowercase prose ("ready to go") but matches "Go," / "Golang".
  - Job "We want a nice person" → `score` `null`.
- [ ] **Step 2:** Run `npx vitest run lib/match` → FAIL.
- [ ] **Step 3:** Implement. Word-boundary regexes built once per alias (escape `.`, `+`, `#`); case-sensitive aliases for short ambiguous words (`Go`, `R`, `C`); weight 1.5 when the line contains `must|required|essential|need`.
- [ ] **Step 4:** Run → PASS. Commit `feat(match): skill dictionary and weighted CV match`.

### Task 4: Personal-data masking

**Files:**
- Create: `lib/privacy/mask.ts`
- Test: `lib/privacy/mask.test.ts`

**Interfaces:**
- Produces: `type TagKind = "NAME" | "EMAIL" | "PHONE" | "LINK" | "ID" | "ADDRESS" | "HIDDEN"`; `maskPersonalData(text: string, opts?: { extraTerms?: string[] }): { masked: string; map: Record<string, string>; found: TagKind[] }` (tags `[EMAIL-1]` …, the same value always maps to the same tag); `unmask(text: string, map: Record<string, string>): string`; `findPersonalData(text: string): TagKind[]` (EMAIL, PHONE, LINK only — used by the server).

- [ ] **Step 1: Failing tests**
  - "Abdul Subhan\nabdul.s@gmail.com | +92 300 1234567 | linkedin.com/in/abdul" → masked contains `[NAME-1]`, `[EMAIL-1]`, `[PHONE-1]`, `[LINK-1]` and none of the raw values.
  - Phones masked: `+971 50 123 4567`, `0300-1234567`, `(021) 3456 7890`. Not masked: `2019-2023`, `5+ years`, `40,000 users`, `v16.4.6`.
  - IDs masked: CNIC `42101-1234567-1`, Emirates ID `784-1990-1234567-1`.
  - Address line "House 12, Street 4, Block B, Gulshan, Karachi" → `[ADDRESS-1]`.
  - `extraTerms: ["Alfred"]` → every "Alfred" becomes `[HIDDEN-1]`.
  - `unmask("Hi [ name-1 ], mail [EMAIL-1]", map)` restores both; an unknown `[PHONE-9]` stays as is.
  - Round trip: `unmask(masked, map) === original` for the CV fixture.
  - `findPersonalData(masked)` → `[]`; `findPersonalData("call +971501234567")` → `["PHONE"]`.
- [ ] **Step 2:** Run `npx vitest run lib/privacy` → FAIL.
- [ ] **Step 3:** Implement. Order: links, emails, IDs, phones, address lines, name (first non-empty line when it is 2–4 capitalised words, also each of those words elsewhere), extra terms. Phone = 9–15 digits total, starts with `+`, `0` or `(`, separators space/dash/dot only.
- [ ] **Step 4:** Run → PASS. Commit `feat(privacy): mask and unmask personal data`.

### Task 5: Sample data and PDF reading

**Files:**
- Create: `constants/sample.ts`, `constants/config.ts`, `lib/pdf/extract-text.ts`

**Interfaces:**
- Produces: `SAMPLE: { job: string; cv: string; outputs: Record<AiTool, string> }`; `AI_TOOLS = ["bullets", "cover-letter", "interview"] as const`, `type AiTool`; `LIMITS = { jobChars: 12000, cvChars: 15000, pdfBytes: 5_000_000, dailyAi: 5 }`; `extractPdfText(file: File): Promise<string>` (client only, dynamic-imports `pdfjs-dist`, worker via `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`, joins items per line, throws `PdfError("empty" | "too-big" | "not-pdf")`).
- Sample outputs are written with real-looking fictional data (no real person) and stored already unmasked.

- [ ] **Step 1:** Write the constants and the extractor.
- [ ] **Step 2:** `npm run typecheck` → pass. Commit `feat: sample data and in-browser PDF text extraction`.

### Task 6: Check page (browser-only flow)

**Files:**
- Create: `app/check/page.tsx`, `components/check/{check-flow.tsx,job-input.tsx,cv-input.tsx,match-result.tsx}`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `matchCv`, `extractPdfText`, `SAMPLE`, UI library.
- Produces: `CheckFlow({ signedIn: boolean; remaining: number | null; sample?: boolean })` — holds `{ job, cv, result }` state; renders `MatchResult` then `AiTools` (Task 8) below it. `/check?sample=1` preloads `SAMPLE`.

- [ ] **Step 1:** Build inputs (PDF drop with `ScanBar` while reading, "paste text instead" toggle), result (ring, chips, confetti ≥ 80, "can't score" state), sample preload.
- [ ] **Step 2:** In the browser: sample flow shows the score; an image-only PDF shows the read error and opens paste mode; mobile 375 px has no sideways scroll.
- [ ] **Step 3:** `npm run check`. Commit `feat(check): browser-only match flow with sample`.

### Task 7: Auth, provider adapter, daily limit, AI route

**Files:**
- Create: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `lib/ai/model.ts`, `lib/ai/prompts.ts`, `lib/limits/daily.ts`, `app/api/ai/[tool]/route.ts`
- Test: `lib/ai/model.test.ts`, `app/api/ai/[tool]/route.test.ts`

**Interfaces:**
- Produces: `auth()`, `signIn`, `signOut`, `handlers` (Auth.js v5, Google + GitHub, JWT; `session.user.id` = `${provider}:${providerAccountId}`); `getModel(env?: NodeJS.ProcessEnv): LanguageModel` (throws on unknown provider or missing `AI_MODEL`); `PROMPTS: Record<AiTool, { system: string; user(job: string, cv: string): string }>` (system says: keep `[TAG-n]` placeholders exactly); `takeDailyRun(userId): Promise<{ ok: boolean; remaining: number; resetAt: number }>`, `refundDailyRun(userId): Promise<void>`, `remainingRuns(userId): Promise<number>` (key `jobfit:runs:{userId}:{YYYY-MM-DD UTC}`, INCR + EXPIRE 172800; in-memory Map when `UPSTASH_REDIS_REST_URL` is unset and `NODE_ENV !== "production"`, error in production).
- Route `POST /api/ai/[tool]` body `{ job: string; cv: string }` → 401 `{error:"unauthorized"}` | 404 unknown tool | 400 `{error:"invalid"}` / `{error:"personal-data"}` | 429 `{error:"limit", resetAt}` | 200 text stream with header `X-Runs-Remaining`. Provider error before the first chunk → refund + 502 `{error:"provider"}`.

- [ ] **Step 1: Failing tests** (mock `@/auth`, `@/lib/limits/daily`, `@/lib/ai/model` with the AI SDK's mock model from `ai/test`)
  - no session → 401 and the model is never called
  - unknown tool → 404; body over caps → 400; body with `x@y.com` → 400 `personal-data`
  - `takeDailyRun` returns `ok:false` → 429 with `resetAt`
  - happy path → 200, body is the mocked text, `X-Runs-Remaining` = "4"
  - model throws → 502 and `refundDailyRun` called
  - `getModel({AI_PROVIDER:"groq", AI_MODEL:"x"})` returns a model whose `provider` contains `groq`; unknown provider throws.
- [ ] **Step 2:** Run `npx vitest run app/api lib/ai` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS. `npm run check`. Commit `feat(ai): session-gated streaming AI route with daily limit`.

### Task 8: AI tools UI

**Files:**
- Create: `components/check/{ai-tools.tsx,sign-in-card.tsx,mask-preview.tsx,ai-output.tsx}`, `components/layout/{site-header.tsx,auth-button.tsx}`

**Interfaces:**
- Consumes: `maskPersonalData`, `unmask`, route contract from Task 7, `SAMPLE.outputs` in sample mode.
- Produces: `AiTools({ job, cv, signedIn, remaining, sample })`.

- [ ] **Step 1:** Tabs; signed-out blurred preview + `SignInCard` (Google, GitHub); `MaskPreview` dialog (mono text, click a word to add it to `extraTerms`, count of hidden items, "Send hidden version"); streamed output via `fetch` + `ReadableStream` reader, `unmask` on every render; Copy, Download `.txt`, Regenerate; remaining counter; error messages for 429/502.
- [ ] **Step 2:** In the browser with `AI_PROVIDER` set locally: run each tool once; verify the network request body has no raw email/phone.
- [ ] **Step 3:** `npm run check`. Commit `feat(check): AI tools with mask preview and streaming`.

### Task 9: Landing, privacy page, Arabic

**Files:**
- Create: `app/page.tsx` (landing), `app/privacy/page.tsx`, `messages/ar.json`, locale switch (cookie `NEXT_LOCALE`, `dir="rtl"`), `app/opengraph-image.tsx`

- [ ] **Step 1:** Landing per agreed mockup; privacy page in plain words (what runs in the browser, what is sent, what is stored: only a daily counter; sign-in data: name/email from Google/GitHub kept in your browser cookie only).
- [ ] **Step 2:** `ar.json` with the same keys, IBM Plex Sans Arabic font, RTL check in the browser.
- [ ] **Step 3:** `npm run check`. Commit `feat: landing, privacy page and Arabic`.

### Task 10: E2E smoke, README, release

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`, `README.md`

- [ ] **Step 1:** E2E: landing → "Try a sample" → score visible; AI tab shows sign-in card when signed out; `POST /api/ai/cover-letter` without a cookie → 401. Run once (on demand from then on).
- [ ] **Step 2:** README: what it is, privacy model, env table, step-by-step account setup (AI Studio key, Google OAuth, GitHub OAuth, Upstash, Vercel).
- [ ] **Step 3 (with Abdul's OK):** create public repo `AbdulSubhan1/jobfit`, push, PR `feature/mvp` → `main`; Vercel project + env; portfolio entry in `~/portfolio/lib/projects.ts` with screenshots and GIF.
