import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Sans_Arabic, JetBrains_Mono, Syne } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Providers } from "@/components/layout/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { routing, RTL_LOCALES } from "@/i18n/routing";
import "../globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
// Syne and DM Sans have no Arabic letters; the browser falls back to this per character
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", weight: ["400", "600", "700"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={RTL_LOCALES.includes(locale) ? "rtl" : "ltr"}
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} ${arabic.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Providers>
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
