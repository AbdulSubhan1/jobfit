"use client";

import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button, ButtonLink, Icon } from "@/components/ui";

export function AuthButton() {
  const t = useTranslations("nav");
  const { data, status } = useSession();

  if (status === "loading") return null;
  if (!data?.user) {
    return (
      <ButtonLink href="/check" size="sm" variant="primary">
        {t("check")}
      </ButtonLink>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-2">
      {data.user.name && (
        <span className="hidden truncate text-sm font-medium sm:inline">{t("hi", { name: data.user.name })}</span>
      )}
      <Button size="sm" onClick={() => signOut({ redirectTo: "/" })}>
        <Icon name="logout" size={16} />
        {t("signOut")}
      </Button>
    </div>
  );
}
