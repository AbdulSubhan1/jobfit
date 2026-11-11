import { setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/ui";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="p-8">
      <Logo size="lg" />
    </main>
  );
}
