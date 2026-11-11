import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckFlow } from "@/components/check/check-flow";
import { SectionHeading } from "@/components/ui";
import { dailyLimit } from "@/lib/limits/daily";

export default async function CheckPage({ params, searchParams }: PageProps<"/[locale]/check">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { sample } = await searchParams;
  const t = await getTranslations("check");

  return (
    <main className="bg-dots">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6">
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
        <CheckFlow key={String(sample)} sample={sample === "1"} limit={dailyLimit()} />
      </div>
    </main>
  );
}
