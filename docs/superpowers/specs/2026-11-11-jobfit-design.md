# JobFit — design

Date: 2026-11-11 · Owner: Abdul Subhan · Status: flow and look agreed in chat; items marked _(call)_ are builder decisions

## Why

Abdul is job hunting (remote, GCC or Karachi). His portfolio already shows two internal tools (PolicyDesk, CRM Kit). JobFit shows the skills those don't: a consumer product, AI streaming, sign-in, privacy engineering and in-browser file parsing. It should be good enough that real job seekers use it from a LinkedIn post. It must cost nothing to run.

## Goals

- Paste a job description, drop a CV (PDF), get a match score with matched and missing skills — instantly, in the browser, without signing in.
- Signed-in users get three AI tools, streamed: rewritten CV bullets, a cover letter, interview questions.
- Personal data is hidden before anything reaches the AI and put back on the user's screen.
- The AI provider and model are chosen by environment variables only.
- A UI library with one source of truth for tokens and components, so the project grows into a standard (same rules as PolicyDesk).

## Non-goals

- Saved history, CV storage, payments, a CV builder, job search or scraping.
- DOCX or image CV upload (PDF only; a "paste CV text" fallback covers scanned PDFs).

## Anti-goals (a failure even if it works)

- A CV or result stored on our server, or a raw email or phone number reaching the AI.
- An AI route that answers without a valid session.
- A plain, templated UI. The look below is part of the product.
- A demo that needs the AI: "Try a sample" must work with no keys at all.

## User flow (agreed)

1. **Landing** `/`: the promise, "Check my CV", "Try a sample", a privacy line.
2. **Check** `/check`: job description textarea and PDF drop zone (or paste CV text). No sign-in.
3. **Match result**: score ring (counts up), "you have" chips, "missing" chips, short tips. Confetti at 80% or more.
4. **AI tools**: tabs for CV bullets, Cover letter, Interview prep. Signed out: blurred preview and a sign-in card.
5. **"What the AI will see"**: the exact masked text with tags such as `[EMAIL-1]`. Click any word to hide it too, then "Send hidden version".
6. **Streaming result** with real values put back. Copy, Download, Regenerate. "3 of 5 AI runs left today · nothing saved".

Also `/privacy` (plain-language privacy page) and `/design` (public UI library showcase).

## Look (agreed)

- **Style:** Bold pop — thick navy outlines, hard offset shadows, buttons that lift on hover and press on click, faint dot grid.
- **Colours:** mint `#d7f5e6` background; navy `#0f1f3d` ink and primary; pink `#ff5c8a` highlight and score ring; sun `#ffd23f` stickers; chips "have" `#bdeccf`, "missing" `#ffd1dc`. Long text sits on plain white cards.
- **Fonts:** Syne (headlines, buttons, labels); DM Sans (body and **every number**, tabular digits); JetBrains Mono (masked text). Arabic later with a matching font _(call: IBM Plex Sans Arabic)_.
- **Motion:** score ring fill and count-up, chip pop-in, typing caret on streams, floating cards, wobbling sticker, PDF scan bar, confetti at 80%+, step transitions. All off under `prefers-reduced-motion`.

## How it's built

### Stack _(calls unless noted)_
Next.js 16 App Router, TypeScript strict, Tailwind v4, Vercel AI SDK, Auth.js v5 (requested), Upstash Redis (free: 500K commands a month), pdfjs-dist, next-intl, Vitest, Playwright. Same coding standard as PolicyDesk (`AGENTS.md`), adapted.

### UI library — single source of truth
- Tokens only in `app/globals.css` `@theme` (colours, fonts, radii, shadows, motion). No hex values anywhere else.
- Components in `components/ui/`, one per file, exported from `index.ts`, listed in `registry.ts`, demoed at `/design`.
- Shared class recipes in `components/ui/styles.ts`; add variants rather than overriding with `className`.
- ESLint blocks raw `button/input/textarea/a/img/svg`, inline styles and outside UI kits. `scripts/ui-usage.ts` keeps `usage.json` in sync. `npm run check` runs it all.

### AI provider (requirement)
`lib/ai/model.ts` reads `AI_PROVIDER` (`google | groq | openai | anthropic | ollama`) and `AI_MODEL`. Keys come from each SDK's standard env var, server only.
- Default: Google Gemini **Flash-Lite**. Free tier (checked Nov 2026): Flash about 20 requests a day, Flash-Lite about 500 a day, Pro not free. Groq is about 1K a day per model but 8K tokens a minute, so it's the fallback. Exact quotas live in each console.

### Privacy (requirement)
- `lib/privacy/mask.ts` (browser) finds emails, phone numbers, URLs and profile links, ID numbers (CNIC, Emirates ID, passport-like), postal-address lines, and the name (the CV's first line, plus words the user adds). It replaces each with a numbered tag (`[EMAIL-1]`) and returns the map. The user can hide more words.
- `unmask` swaps the tags back in the streamed text on every render.
- Server defence: the AI route rejects input that still contains an email, phone or URL pattern (400).
- Nothing is stored on the server. The only server state is a per-user daily counter (user id and count, expiring within a day). The privacy page says so in plain words.

### Verified users only (requirement)
- Auth.js v5 with JWT sessions (no database). Google and GitHub.
- Email one-time code is **deferred**: free senders such as Resend only deliver to your own address until a custom domain is verified. Revisit if Abdul gets a domain.
- `app/api/ai/[tool]/route.ts`: `auth()` → 401; Zod validation → 400; daily limit → 429 with reset time; then `streamText` → text stream. Streaming routes are the one allowed API route type besides Auth.js's own.
- Daily limit: `AI_DAILY_LIMIT` (default 5) per user, Upstash fixed window. An in-memory limiter is used when the Upstash env is missing (local dev only).

### Matching (browser)
- `lib/match/skills.ts`: a curated dictionary (about 300 tech and business skills with aliases, e.g. `k8s → Kubernetes`, `JS → JavaScript`).
- `lib/match/score.ts`: skills in the job (lines saying "must" or "required" weigh 1.5×) against skills in the CV → score, have, missing.
- `constants/sample.ts`: a saved sample job, CV, match and AI outputs, so the demo never calls the API.

## Done means
Live on Abdul's Vercel Hobby account; public repo `github.com/AbdulSubhan1/jobfit` with no secrets; Vitest tests for masking and for the AI route's auth and limit; an entry in `~/portfolio/lib/projects.ts` with screenshots and a short demo GIF.

## Needs from Abdul (accounts only he can create)
Gemini API key (AI Studio), Google OAuth client, GitHub OAuth app, Upstash Redis database, Vercel project. The README gets a step-by-step setup list.
