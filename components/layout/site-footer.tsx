import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const REPO = "https://github.com/AbdulSubhan1/jobfit";
const PORTFOLIO = "https://abdulsubhan1.github.io";

export async function SiteFooter() {
  const t = await getTranslations();
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-mint">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 text-sm sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
        <p className="min-w-0">{t("footer.note")}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
          <Link href="/privacy" className="hover:underline">
            {t("nav.privacy")}
          </Link>
          <Link href="/design" className="hover:underline">
            {t("nav.design")}
          </Link>
          <Link href={REPO} className="hover:underline">
            {t("footer.source")}
          </Link>
          <Link href={PORTFOLIO} className="hover:underline">
            {t("footer.by")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
