"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Switches between English and Arabic on the same page. */
export function LocaleSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";
  return (
    <Link href={pathname} locale={other} lang={other} className="text-sm font-bold hover:underline">
      {t("language")}
    </Link>
  );
}
