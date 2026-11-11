// Fixed values used across the app. Change them here only.

export const AI_TOOLS = ["bullets", "cover-letter", "interview"] as const;
export type AiTool = (typeof AI_TOOLS)[number];

export const LIMITS = {
  jobChars: 12_000,
  cvChars: 15_000,
  pdfBytes: 5_000_000,
  /** Default AI runs per user per UTC day; AI_DAILY_LIMIT overrides it. */
  dailyAi: 5,
} as const;

/** Score at or above which the result celebrates. */
export const CELEBRATE_AT = 80;
