"use client";

import { useTranslations } from "next-intl";
import { Alert, Card, Chip, Confetti, ScoreRing, Sticker } from "@/components/ui";
import { CELEBRATE_AT } from "@/constants/config";
import type { MatchResult as Result } from "@/lib/match/score";

const CHIP_STAGGER_MS = 70;

function band(score: number) {
  if (score >= CELEBRATE_AT) return "great";
  if (score >= 60) return "good";
  if (score >= 40) return "some";
  return "big";
}

export function MatchResult({ result }: { result: Result }) {
  const t = useTranslations("check.result");
  const { score, have, missing, jobSkillCount } = result;

  if (score === null) {
    return (
      <Card>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <ScoreRing value={null} label={t("noScore")} />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold">{t("noScore")}</h2>
            <p className="mt-1 text-ink-soft">{t("noScoreHint")}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card sticker={<Sticker>{t(`bands.${band(score)}`)}</Sticker>}>
      <Confetti fire={score >= CELEBRATE_AT} />
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-8">
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <ScoreRing value={score} size="lg" label={t("label")} />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold">{t(`bands.${band(score)}`)}</h2>
            <p className="text-sm text-ink-soft tabular-nums">
              {t("summary", { have: have.length, total: jobSkillCount })}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-4">
          <div>
            <h3 className="mb-2 font-display text-sm font-extrabold tracking-widest uppercase">{t("have")}</h3>
            <div className="flex flex-wrap gap-1.5">
              {have.map((skill, i) => (
                <Chip key={skill} tone="have" delay={i * CHIP_STAGGER_MS}>
                  {skill}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-display text-sm font-extrabold tracking-widest uppercase">{t("missing")}</h3>
            {missing.length ? (
              <div className="flex flex-wrap gap-1.5">
                {missing.map((skill, i) => (
                  <Chip key={skill} tone="miss" delay={(have.length + i) * CHIP_STAGGER_MS}>
                    {skill}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="text-sm">{t("noneMissing")}</p>
            )}
          </div>
          <Alert>{t("tip")}</Alert>
        </div>
      </div>
    </Card>
  );
}
