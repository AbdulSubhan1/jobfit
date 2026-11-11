"use client";

import { useSession } from "next-auth/react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Icon, SectionHeading, Sticker, Tabs } from "@/components/ui";
import { AI_TOOLS, type AiTool } from "@/constants/config";
import { SAMPLE } from "@/constants/sample";
import { maskForAi, unmask } from "@/lib/privacy/mask";
import { AiOutput } from "./ai-output";
import { MaskPreview } from "./mask-preview";
import { SignInCard } from "./sign-in-card";
import { useAiStream } from "./use-ai-stream";

type Props = {
  job: string;
  cv: string;
  sample: boolean;
  /** AI runs per day, for the copy before the first run. */
  limit: number;
  onBeforeSignIn: () => void;
};

export function AiTools({ job, cv, sample, limit, onBeforeSignIn }: Props) {
  const t = useTranslations("ai");
  const format = useFormatter();
  const { status } = useSession();
  const [tab, setTab] = useState<AiTool>("cover-letter");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extraTerms, setExtraTerms] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const { runs, start, stop } = useAiStream(setRemaining);

  const masked = useMemo(() => maskForAi(cv, job, extraTerms), [cv, job, extraTerms]);
  const run = runs[tab];
  const ready = job.trim() && cv.trim();

  function send() {
    setPreviewOpen(false);
    start(tab, { job: masked.job, cv: masked.cv }, masked.map);
  }

  let body;
  if (sample) {
    body = <SampleOutput key={tab} text={SAMPLE.outputs[tab]} />;
  } else if (status !== "authenticated") {
    body = status === "loading" ? null : <SignInCard limit={limit} onBeforeSignIn={onBeforeSignIn} />;
  } else if (!run || run.status === "idle" || (run.status === "error" && !run.raw)) {
    body = (
      <div className="grid justify-items-start gap-3">
        {run?.error && (
          <Alert tone="error">
            {t(`errors.${run.error.code}`, {
              time: run.error.resetAt ? format.dateTime(run.error.resetAt, { timeStyle: "short" }) : "",
            })}
          </Alert>
        )}
        <Button variant="primary" size="lg" disabled={!ready} onClick={() => setPreviewOpen(true)}>
          <Icon name="sparkle" /> {t(`generate.${tab}`)}
        </Button>
        {!ready && <p className="text-sm text-ink-soft">{t("needInputs")}</p>}
      </div>
    );
  } else {
    body = (
      <AiOutput
        text={unmask(run.raw, run.map)}
        streaming={run.status === "streaming"}
        filename={`jobfit-${tab}.txt`}
        onStop={stop}
        onRegenerate={() => setPreviewOpen(true)}
      />
    );
  }

  return (
    <Card>
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title={t("title")} description={t("intro")} />
          {sample && <Sticker tone="pop">{t("sampleSticker")}</Sticker>}
        </div>
        <Tabs
          label={t("tabs.label")}
          value={tab}
          onChange={setTab}
          items={AI_TOOLS.map((id) => ({ id, label: t(`tabs.${id}`) }))}
        />
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-w-0">
          {body}
        </div>
        <p className="text-sm text-ink-soft tabular-nums">
          {sample ? t("sampleNote") : remaining === null ? t("runsPerDay", { limit }) : t("runsLeft", { remaining })}
        </p>
      </div>
      {!sample && (
        <MaskPreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onSend={send}
          masked={masked}
          extraTerms={extraTerms}
          onExtraTermsChange={setExtraTerms}
        />
      )}
    </Card>
  );
}

/** Types out a saved sample result, so the demo feels like the real stream without calling the AI. */
function SampleOutput({ text }: { text: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const step = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? text.length : 9;
    const id = setInterval(() => {
      setShown((n) => {
        if (n + step >= text.length) clearInterval(id);
        return Math.min(text.length, n + step);
      });
    }, 16);
    return () => clearInterval(id);
  }, [text]);

  return <AiOutput text={text.slice(0, shown)} streaming={shown < text.length} filename="jobfit-sample.txt" />;
}
