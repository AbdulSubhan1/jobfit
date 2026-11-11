import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroCard } from "@/components/home/hero-card";
import { ButtonLink, Card, Icon, SectionHeading, type IconName } from "@/components/ui";
import { Link } from "@/i18n/navigation";

const STEP_ICONS: IconName[] = ["text", "upload", "eye", "sparkle"];
const PRIVACY_ICONS: IconName[] = ["shield", "lock", "check"];

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const steps = t.raw("steps") as { title: string; body: string }[];
  const privacy = t.raw("privacy") as { title: string; body: string }[];

  return (
    <main>
      <section className="overflow-hidden border-b-[3px] border-ink bg-dots">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div className="min-w-0 animate-rise">
            <h1 className="font-display text-5xl leading-[0.98] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              {t("titleStart")}{" "}
              <span className="inline-block animate-wobble rounded-xl border-[3px] border-ink bg-pop px-2 text-white">
                {t("titleFit")}
              </span>{" "}
              {t("titleEnd")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">{t("intro")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/check" variant="primary" size="lg">
                {t("cta")} <Icon name="arrow-right" />
              </ButtonLink>
              <ButtonLink href="/check?sample=1" size="lg">
                {t("sample")}
              </ButtonLink>
            </div>
          </div>
          <div className="min-w-0 pe-3 pt-4 lg:ps-6">
            <HeroCard />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6">
        <SectionHeading title={t("stepsTitle")} />
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="min-w-0">
              <Card>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full border-2 border-ink bg-sun font-sans font-extrabold tabular-nums">
                    {i + 1}
                  </span>
                  <Icon name={STEP_ICONS[i]} />
                </div>
                <h3 className="mt-4 font-display text-lg font-extrabold">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y-[3px] border-ink bg-ink text-mint">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("privacyTitle")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {privacy.map((item, i) => (
              <div key={item.title} className="min-w-0">
                <span className="grid size-11 place-items-center rounded-full border-2 border-mint text-sun">
                  <Icon name={PRIVACY_ICONS[i]} />
                </span>
                <h3 className="mt-3 font-display text-lg font-extrabold">{item.title}</h3>
                <p className="mt-1 text-sm text-mint/80">{item.body}</p>
              </div>
            ))}
          </div>
          <Link href="/privacy" className="font-bold text-sun underline underline-offset-4">
            {t("privacyLink")}
          </Link>
        </div>
      </section>

      <section className="bg-dots">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-5 px-4 py-20 text-center sm:px-6">
          <SectionHeading title={t("endTitle")} description={t("endBody")} />
          <ButtonLink href="/check" variant="primary" size="lg">
            {t("cta")} <Icon name="arrow-right" />
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
