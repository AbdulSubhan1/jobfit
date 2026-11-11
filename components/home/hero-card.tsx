"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, Chip, ScoreRing, Sticker, StreamText } from "@/components/ui";

const DEMO = { score: 72, have: ["React", "Next.js", "TypeScript"], missing: ["GraphQL", "AWS"] };

/** The floating score card on the landing page: a live preview of a real result. */
export function HeroCard() {
  const t = useTranslations("home.card");
  const letter = t("letter");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let typing: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      typing = setInterval(() => setShown((n) => (n >= letter.length ? n : n + 1)), 45);
    }, 1200);
    return () => {
      clearTimeout(start);
      clearInterval(typing);
    };
  }, [letter]);

  return (
    <Card float sticker={<Sticker>{t("sticker")}</Sticker>}>
      <div className="flex items-center gap-4">
        <ScoreRing value={DEMO.score} label={t("band")} />
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold">{t("band")}</p>
          <p className="text-sm text-ink-soft">{t("gaps")}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {DEMO.have.map((s, i) => (
          <Chip key={s} tone="have" delay={400 + i * 90}>
            {s}
          </Chip>
        ))}
        {DEMO.missing.map((s, i) => (
          <Chip key={s} tone="miss" delay={400 + (DEMO.have.length + i) * 90}>
            {s}
          </Chip>
        ))}
      </div>
      <div className="mt-4 border-t-[2.5px] border-ink pt-3 font-mono text-xs">
        <StreamText text={letter.slice(0, shown)} streaming={shown < letter.length} />
      </div>
    </Card>
  );
}
