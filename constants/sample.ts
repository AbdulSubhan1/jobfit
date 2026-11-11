import type { AiTool } from "./config";

// A saved demo: a fictional job seeker and job, with AI results written ahead of time.
// "Try a sample" uses this, so demos never call the AI.

const job = `Senior Frontend Engineer — Dubai (remote-friendly)

About the role
We're a fintech building payments for small businesses across the GCC. You'll own our customer dashboard end to end.

Requirements
- Must have 5+ years with React and TypeScript
- Must have shipped production apps with Next.js
- Strong CSS skills; Tailwind CSS a plus
- Experience with REST APIs and GraphQL
- Automated testing with Jest or Playwright

Nice to have
- AWS or Vercel deployments, CI/CD
- Accessibility (WCAG) and web performance
- Mentoring junior engineers
- Arabic`;

const cv = `Sara Malik
sara.malik@example.com | +971 50 123 4567 | linkedin.com/in/saramalik-demo
Apartment 1204, Marina Heights, Dubai Marina, Dubai

Frontend Engineer with 6 years building React and TypeScript products.

Experience
Frontend Engineer, Brightpay — 2021 to now
• Built the merchant dashboard in Next.js and Tailwind CSS used by 12,000 businesses
• Moved 40 screens from REST calls to a typed API layer, cutting bugs reported by support by a third
• Set up Playwright tests and a GitHub Actions pipeline on Vercel
• Mentored two junior developers through their first year

Web Developer, Souq Studio — 2019 to 2021
• Built responsive storefronts with React and Redux
• Improved Lighthouse performance scores from 54 to 91 on the main product pages

Skills
React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, Playwright, Git, Figma
Languages: English, Urdu`;

const outputs: Record<AiTool, string> = {
  bullets: `Here are your strongest bullets, rewritten for this role:

• Led the Next.js and TypeScript rebuild of Brightpay's merchant dashboard, now used daily by 12,000 small businesses across the UAE.
• Designed a typed API layer over 40 REST endpoints, cutting support-reported UI bugs by about a third.
• Introduced Playwright end-to-end tests and a GitHub Actions → Vercel pipeline, so every pull request ships with a tested preview.
• Raised Lighthouse performance on key product pages from 54 to 91 through code-splitting, image optimisation and leaner CSS.
• Mentored two junior engineers through their first year, pairing on reviews and setting up shared component patterns.

Worth adding if true:
• Any GraphQL work, even a side project — it's listed as a requirement.
• Accessibility work (keyboard navigation, screen readers, WCAG checks).
• Jest unit tests alongside Playwright.`,
  "cover-letter": `Dear Hiring Team,

I'm Sara Malik, a frontend engineer in Dubai with six years of React and TypeScript, and I'd love to own your customer dashboard.

At Brightpay I rebuilt our merchant dashboard in Next.js and Tailwind CSS. Twelve thousand small businesses now use it every day to get paid, which is close to the problem you're solving across the GCC. Along the way I put a typed layer over 40 REST endpoints, which cut the UI bugs our support team saw by about a third, and I set up Playwright tests with a GitHub Actions pipeline on Vercel so every change ships with a tested preview.

I care about speed and access as much as features: I took our main product pages from a Lighthouse score of 54 to 91. I also enjoy growing people — I mentored two junior developers through their first year.

GraphQL is the one item on your list I haven't used in production. I'm learning it now and would be glad to talk through how I'd approach it on your stack.

Thank you for your time. I'd be happy to walk you through the dashboard work in a call.

Kind regards,
Sara Malik
sara.malik@example.com · +971 50 123 4567`,
  interview: `Likely questions for this role, with what to cover:

1. Walk us through the architecture of the Brightpay dashboard.
   Cover: Next.js routing and rendering choices, state, the typed API layer, how you kept 40 screens consistent.

2. How would you add GraphQL to an app that uses REST today?
   Cover: an honest answer that you're new to it in production; schema-first thinking, a gradual move behind your typed client, caching.

3. Tell us about a performance problem you fixed.
   Cover: the 54 → 91 Lighthouse story — how you measured, what you changed, how you kept it from regressing.

4. How do you decide what to test with Playwright versus unit tests?
   Cover: critical money paths end to end, logic in fast unit tests, keeping CI quick.

5. How do you make a payments UI accessible?
   Cover: keyboard flows, focus management in forms and dialogs, error messages screen readers announce, colour contrast.

6. Describe how you mentored a junior developer.
   Cover: a specific example, what changed for them, how you gave feedback in reviews.

Questions to ask them:
• What does "owning the dashboard end to end" include — design, backend contracts, on-call?
• How do you ship to merchants in different GCC countries: one app with settings, or separate builds?`,
};

export const SAMPLE = { job, cv, outputs };
