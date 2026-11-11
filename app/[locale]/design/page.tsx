import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Demo } from "@/components/design-system/demos";
import { Card, Logo, SectionHeading } from "@/components/ui";
import { UI_GROUPS, UI_REGISTRY } from "@/components/ui/registry";

export const metadata: Metadata = { title: "UI library · JobFit" };

// The living style guide: every component in components/ui, rendered from the registry.
export default async function DesignPage({ params }: PageProps<"/[locale]/design">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-dots">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6">
        <header className="grid gap-4">
          <Logo size="lg" />
          <SectionHeading
            as="h1"
            title="UI library"
            description={`${UI_REGISTRY.length} components, one set of tokens in app/globals.css. Pages build UI only from these.`}
          />
        </header>
        {UI_GROUPS.map((group) => (
          <section key={group} className="grid gap-5">
            <SectionHeading title={group} />
            {UI_REGISTRY.filter((c) => c.group === group).map((c) => {
              return (
                <Card key={c.name}>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="grid min-w-0 content-start gap-2">
                      <h3 className="font-display text-xl font-extrabold">{c.name}</h3>
                      <p className="text-sm text-ink-soft">{c.description}</p>
                      <code className="block rounded-lg bg-mint px-2 py-1.5 font-mono text-xs [overflow-wrap:anywhere]">
                        {c.props}
                      </code>
                      <code className="block rounded-lg bg-ink px-2 py-1.5 font-mono text-xs [overflow-wrap:anywhere] text-mint">
                        {c.example}
                      </code>
                    </div>
                    <div className="min-w-0 content-center">
                      <Demo name={c.name} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>
        ))}
      </div>
    </main>
  );
}
