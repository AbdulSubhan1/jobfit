import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

/** Locales written right to left. */
export const RTL_LOCALES: readonly string[] = ["ar"];
