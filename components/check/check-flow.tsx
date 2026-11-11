"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button, Card, Icon } from "@/components/ui";
import { SAMPLE } from "@/constants/sample";
import { useRouter } from "@/i18n/navigation";
import { matchCv, type MatchResult as Result } from "@/lib/match/score";
import { CvInput } from "./cv-input";
import { JobInput } from "./job-input";
import { MatchResult } from "./match-result";

type Props = { sample: boolean };

export function CheckFlow({ sample }: Props) {
  const t = useTranslations("check");
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);
  const [job, setJob] = useState(sample ? SAMPLE.job : "");
  const [cv, setCv] = useState(sample ? SAMPLE.cv : "");
  const [source, setSource] = useState<string | null>(sample ? t("cv.sampleName") : null);
  const [result, setResult] = useState<Result | null>(() => (sample ? matchCv(SAMPLE.job, SAMPLE.cv) : null));
  const [isSample, setIsSample] = useState(sample);

  // Any edit makes the old score stale
  const edit =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setResult(null);
    };

  function check() {
    setResult(matchCv(job, cv));
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function clearSample() {
    setJob("");
    setCv("");
    setSource(null);
    setResult(null);
    setIsSample(false);
    router.replace("/check");
  }

  const ready = job.trim().length > 0 && cv.trim().length > 0;

  return (
    <div className="grid gap-8">
      {isSample && (
        <div className="flex flex-col items-start gap-3 rounded-pop border-[2.5px] border-ink bg-sun px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 font-medium">{t("sampleBanner")}</p>
          <Button size="sm" onClick={clearSample}>
            {t("clearSample")}
          </Button>
        </div>
      )}

      <Card>
        <div className="grid gap-6 md:grid-cols-2">
          <JobInput value={job} onChange={edit(setJob)} />
          <CvInput value={cv} onChange={edit(setCv)} source={source} onSourceChange={setSource} />
        </div>
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button variant="primary" size="lg" disabled={!ready} onClick={check}>
            {t("submit")} <Icon name="arrow-right" />
          </Button>
          {!ready && <p className="text-sm text-ink-soft">{t("needBoth")}</p>}
        </div>
      </Card>

      <div ref={resultRef} className="scroll-mt-6">
        {result && (
          <div className="grid animate-rise gap-8">
            <MatchResult result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
