import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { AuthButton } from "./auth-button";
import { LocaleSwitch } from "./locale-switch";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-mint/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label={t("home")} className="rounded-lg focus-visible:ring-4 focus-visible:ring-pop/40">
          <Logo />
        </Link>
        <nav className="flex min-w-0 items-center gap-4">
          <Link href="/privacy" className="hidden text-sm font-bold hover:underline sm:inline">
            {t("privacy")}
          </Link>
          <LocaleSwitch />
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
