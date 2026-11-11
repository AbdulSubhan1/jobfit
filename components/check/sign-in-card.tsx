"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button, Card, Icon } from "@/components/ui";

type Props = { limit: number; onBeforeSignIn: () => void };

export function SignInCard({ limit, onBeforeSignIn }: Props) {
  const t = useTranslations("ai.signIn");

  function go(provider: "google" | "github") {
    onBeforeSignIn();
    signIn(provider, { redirectTo: window.location.href });
  }

  return (
    <Card tone="paper">
      <div className="grid justify-items-center gap-3 py-2 text-center">
        <span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-sun">
          <Icon name="lock" />
        </span>
        <h3 className="font-display text-xl font-extrabold">{t("title")}</h3>
        <p className="max-w-md text-sm text-ink-soft">{t("body", { limit })}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => go("google")}>
            <Icon name="google" /> {t("google")}
          </Button>
          <Button onClick={() => go("github")}>
            <Icon name="github" /> {t("github")}
          </Button>
        </div>
        <p className="text-xs text-ink-soft">{t("keep")}</p>
      </div>
    </Card>
  );
}
