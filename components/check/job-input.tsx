"use client";

import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui";
import { LIMITS } from "@/constants/config";

type Props = { value: string; onChange: (value: string) => void };

export function JobInput({ value, onChange }: Props) {
  const t = useTranslations("check.job");
  return (
    <div className="grid min-w-0 gap-2">
      <label htmlFor="job" className="font-display text-lg font-extrabold">
        {t("label")}
      </label>
      <Textarea
        id="job"
        rows={12}
        maxLength={LIMITS.jobChars}
        placeholder={t("placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-end text-xs text-ink-soft tabular-nums">
        {t("count", { count: value.length, max: LIMITS.jobChars })}
      </p>
    </div>
  );
}
