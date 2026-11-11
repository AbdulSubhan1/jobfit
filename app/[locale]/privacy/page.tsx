import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, SectionHeading } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  return { title: `${t("title")} · JobFit` };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacyPage");
  const sections = t.raw("sections") as { title: string; body: string }[];

  return (
    <main className="bg-dots">
      <div className="mx-auto grid max-w-3xl gap-8 px-4 py-12 sm:px-6">
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
        <Card>
          <div className="grid gap-6">
            {sections.map((s) => (
              <section key={s.title} className="min-w-0">
                <h2 className="font-display text-lg font-extrabold">{s.title}</h2>
                <p className="mt-1 leading-relaxed text-ink-soft">{s.body}</p>
              </section>
            ))}
          </div>
        </Card>
        <p className="text-sm text-ink-soft">{t("updated")}</p>
      </div>
    </main>
  );
}
