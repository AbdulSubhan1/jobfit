"use client";

import { useTranslations } from "next-intl";
import { Button, Chip, Dialog, Icon, MaskedText } from "@/components/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  masked: { cv: string; job: string; map: Record<string, string> };
  extraTerms: string[];
  onExtraTermsChange: (terms: string[]) => void;
};

export function MaskPreview({ open, onClose, onSend, masked, extraTerms, onExtraTermsChange }: Props) {
  const t = useTranslations("ai.preview");
  const tc = useTranslations("common");
  const hide = (word: string) => !extraTerms.includes(word) && onExtraTermsChange([...extraTerms, word]);
  const wordLabel = (word: string) => t("hideWord", { word });

  return (
    <Dialog open={open} onClose={onClose} title={t("title")} closeLabel={tc("close")}>
      {/* The actions come first so keyboard users reach Send without tabbing through every word; they show last */}
      <div className="flex flex-col gap-4">
        <div className="sticky bottom-0 order-last -mx-5 -mb-5 flex flex-wrap justify-end gap-3 border-t-[3px] border-ink bg-card px-5 py-3">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={onSend}>
            <Icon name="shield" /> {t("send")}
          </Button>
        </div>
        <p className="text-sm text-ink-soft">{t("intro")}</p>
        <p className="font-display font-extrabold">{t("hiddenCount", { count: Object.keys(masked.map).length })}</p>

        {extraTerms.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold">{t("extra")}</span>
            {extraTerms.map((word) => (
              <Chip key={word} tone="miss" onClick={() => onExtraTermsChange(extraTerms.filter((w) => w !== word))}>
                {word} <Icon name="x" size={12} label={t("unhide", { word })} />
              </Chip>
            ))}
          </div>
        )}

        <section className="grid gap-1.5">
          <h3 className="font-display text-sm font-extrabold tracking-widest uppercase">{t("cv")}</h3>
          <MaskedText text={masked.cv} onWordClick={hide} wordLabel={wordLabel} />
        </section>
        <section className="grid gap-1.5">
          <h3 className="font-display text-sm font-extrabold tracking-widest uppercase">{t("job")}</h3>
          <MaskedText text={masked.job} onWordClick={hide} wordLabel={wordLabel} />
        </section>
      </div>
    </Dialog>
  );
}
