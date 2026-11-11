<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Coding standard

These rules are strict. They apply to every person and every AI model working in this repo. `npm run check` enforces them. If a rule blocks you, change the rule here in a PR. Do not work around it.

## 1. Where things live

| Folder                  | What goes there                                                                           | Never put here                      |
| ----------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| `app/`                  | Routes: `page.tsx`, `layout.tsx`, the Auth.js handler and `app/api/ai/*` streaming routes | Business logic, reusable components |
| `components/ui/`        | The UI library: one component per file, exported from `index.ts`, listed in `registry.ts` | Feature text, data fetching         |
| `components/<feature>/` | Feature sections, e.g. `check/match-result.tsx`                                           | Raw HTML controls                   |
| `constants/`            | Fixed values: limits, AI tools, the sample                                                | Functions with side effects         |
| `lib/`                  | Pure helpers by area: `match/`, `privacy/`, `pdf/`, `ai/`, `limits/`                      | UI code                             |
| `messages/`             | `en.json`, `ar.json`. Every user-facing string                                            | Code                                |
| `docs/`                 | Specs and plans                                                                           | Generated files                     |

## 2. Single source of truth

- A value is defined once and imported everywhere else. Limits: `constants/config.ts`. AI tools: `constants/config.ts`. Skills: `lib/match/skills.ts`.
- Colours, fonts, radii, shadows and animations exist only as tokens in `app/globals.css` (`@theme`). Use token classes (`bg-mint`, `text-ink`, `shadow-pop`), never hex values.
- Shared class recipes live in `components/ui/styles.ts`.
- If you copy a block of code a second time, extract it.

## 3. Next.js rules

- App Router. Pages are **Server Components** by default. Add `"use client"` only when a file needs state, effects or browser APIs.
- API routes are allowed only for the Auth.js handler and AI streaming (`app/api/ai/[tool]/route.ts`).
- Every AI route does, in this order: check the session with `auth()` (401), validate the body with Zod (400), take a daily run (429), then stream. Never trust the UI.
- `params` and `searchParams` are Promises. Await them.

## 4. Privacy (strict)

- CV text, job text and AI output are never stored or logged on the server. Do not `console.log` request bodies.
- Personal data is masked in the browser with `lib/privacy/mask.ts` before any request. The server rejects bodies that still contain an email, phone number or link.
- Keys live only in server env vars. Nothing secret uses the `NEXT_PUBLIC_` prefix.
- The only server-side state is the daily run counter in `lib/limits/daily.ts`.

## 5. UI library (strict)

- Pages and feature components build UI **only** from `@/components/ui`. ESLint blocks raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>`, `<img>` and `<svg>` outside `components/ui`. Use `Button`, `ButtonLink`, `Textarea`, `FileDrop`, `next/link` and `Icon`.
- **No inline styles.** `style={...}` is a lint error everywhere, including `components/ui`. Components that need a value from JavaScript set a CSS variable with `el.style.setProperty` and read it in a class, e.g. `[stroke-dashoffset:var(--ring-offset)]`.
- **No class overrides on library components.** `className` on a library component may only set layout (margin, width, grid placement). For a different look, add a variant in `components/ui/styles.ts`.
- **No UI or styling libraries:** MUI, Radix, shadcn, lucide, clsx, tailwind-merge and framer-motion are blocked by lint. Motion is CSS keyframes from `globals.css`.
- **Icons:** add the path to `components/ui/icon.tsx`. Icon packages are blocked.
- **Motion:** every animation is switched off under `prefers-reduced-motion` (handled once in `globals.css`).
- **Numbers** use `font-sans tabular-nums` (DM Sans). Syne (`font-display`) is for words only.
- **One component per file.** File name is the kebab-case component name.
- New component checklist:
  1. Add `components/ui/<name>.tsx` with a `data-ui="<Name>"` attribute on its root.
  2. Export it from `components/ui/index.ts`.
  3. Add a `registry.ts` entry.
  4. Add a demo in `components/design-system/demos.tsx` (shown at `/design`).
  5. Run `npm run ui:usage`.
- **Layout:** mobile-first. Base classes are for phones; add `sm:`, `md:`, `lg:` for larger screens. Never `max-*` variants. Every flex or grid child that holds text gets `min-w-0`. Responsive grids start with `grid-cols-1`.
- **RTL-safe classes only:** `ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `start-`, `end-`. Never `ml-`, `mr-`, `pl-`, `pr-`, `text-left` or `text-right`.

## 6. Internationalisation

- Every user-facing string goes in `messages/en.json` and `messages/ar.json`, with the same keys in both. Use `getTranslations` in async server components and `useTranslations` elsewhere.
- Message keys may not contain dots. Nest objects instead.

## 7. Code style

- TypeScript strict. No `any`. No unused code.
- Prettier formats everything (`npm run format`). Tailwind classes are sorted by the Prettier plugin.
- Comments explain _why_, not _what_. Keep them short.
- Names: components `PascalCase`, files `kebab-case`, constants `UPPER_SNAKE_CASE`, functions `camelCase`.
- Don't build for hypothetical needs.

## 8. Tests

- Logic in `lib/` and every API route has Vitest tests next to the file (`*.test.ts`). Write the test first.
- E2E (Playwright, `e2e/`) runs on demand, not after every change: `npm run test:e2e -- e2e/<file>.spec.ts`.
- Never run `next build` while this folder's dev server is running. Stop it, build, delete `.next`, restart.

## 9. Before you open a PR

```bash
npm run check   # types, lint (incl. UI rules), formatting, UI registry/usage
npm test        # unit tests
```
