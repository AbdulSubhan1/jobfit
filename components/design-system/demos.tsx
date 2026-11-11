"use client";

import { useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Chip,
  Confetti,
  Dialog,
  FileDrop,
  Icon,
  Logo,
  NumberTicker,
  ScanBar,
  ScoreRing,
  SectionHeading,
  Sticker,
  StreamText,
  Tabs,
  Textarea,
} from "@/components/ui";

// Live demos for /design. Developer docs, so English text is fine here.

function TabsDemo() {
  const [tab, setTab] = useState<"bullets" | "letter" | "interview">("bullets");
  return (
    <Tabs
      label="AI tools"
      value={tab}
      onChange={setTab}
      items={[
        { id: "bullets", label: "CV bullets" },
        { id: "letter", label: "Cover letter" },
        { id: "interview", label: "Interview prep" },
      ]}
    />
  );
}

function FileDropDemo() {
  const [name, setName] = useState<string>();
  const [busy, setBusy] = useState(false);
  return (
    <FileDrop
      accept="application/pdf"
      label="Drop your CV here"
      hint="PDF, up to 5 MB"
      fileName={name}
      busy={busy}
      busyLabel="Reading your CV"
      onFile={(f) => {
        setName(f.name);
        setBusy(true);
        setTimeout(() => setBusy(false), 1500);
      }}
    />
  );
}

function StreamDemo() {
  const full = "Dear Hiring Team,\nI'm a frontend engineer with five years of React and Next.js…";
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  function run() {
    setText("");
    setBusy(true);
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        setBusy(false);
      }
    }, 40);
  }
  return (
    <div className="grid gap-3">
      <Button size="sm" onClick={run}>
        <Icon name="sparkle" /> Stream it
      </Button>
      <StreamText text={text} streaming={busy} />
    </div>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="What the AI will see" closeLabel="Close">
        <p className="font-mono text-sm">[NAME-1] · [EMAIL-1] · [PHONE-1]</p>
      </Dialog>
    </>
  );
}

function ConfettiDemo() {
  const [n, setN] = useState(0);
  return (
    <>
      <Button variant="primary" onClick={() => setN((x) => x + 1)}>
        Celebrate
      </Button>
      <Confetti key={n} fire={n > 0} />
    </>
  );
}

function ScoreDemo() {
  const [v, setV] = useState(72);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ScoreRing value={v} label="Match score" />
      <ScoreRing value={null} label="Not enough skills to score" />
      <Button size="sm" onClick={() => setV(Math.round(Math.random() * 100))}>
        <Icon name="refresh" /> New score
      </Button>
    </div>
  );
}

const DEMOS: Record<string, () => ReactNode> = {
  Button: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">
        Check match <Icon name="arrow-right" />
      </Button>
      <Button>Try a sample</Button>
      <Button variant="ghost">Cancel</Button>
      <Button size="sm">Small</Button>
      <Button variant="primary" size="lg">
        Large
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  ButtonLink: () => (
    <ButtonLink href="/check" variant="primary">
      Check my CV <Icon name="arrow-right" />
    </ButtonLink>
  ),
  Tabs: TabsDemo,
  Textarea: () => <Textarea rows={4} placeholder="Paste the job description" />,
  FileDrop: FileDropDemo,
  Logo: () => (
    <div className="flex items-center gap-6">
      <Logo />
      <Logo size="lg" />
    </div>
  ),
  SectionHeading: () => (
    <SectionHeading eyebrow="Step 1" title="Paste the job" description="We pull the skills out of it." />
  ),
  Card: () => (
    <div className="pe-3 pt-4">
      <Card float sticker={<Sticker>100% private</Sticker>}>
        <p className="font-display font-extrabold">Nice fit!</p>
        <p className="text-sm text-ink-soft">4 gaps to close</p>
      </Card>
    </div>
  ),
  Chip: () => (
    <div className="flex flex-wrap gap-1.5">
      {["React", "Next.js", "TypeScript"].map((s, i) => (
        <Chip key={s} tone="have" delay={i * 100}>
          {s}
        </Chip>
      ))}
      {["GraphQL", "AWS"].map((s, i) => (
        <Chip key={s} tone="miss" delay={300 + i * 100}>
          {s}
        </Chip>
      ))}
    </div>
  ),
  Sticker: () => (
    <div className="flex gap-3">
      <Sticker>100% private</Sticker>
      <Sticker tone="pop">New</Sticker>
    </div>
  ),
  Icon: () => (
    <div className="flex flex-wrap gap-3">
      {(
        [
          "arrow-right",
          "upload",
          "file",
          "lock",
          "shield",
          "sparkle",
          "copy",
          "download",
          "refresh",
          "eye",
          "check",
          "x",
          "logout",
          "text",
          "github",
          "google",
        ] as const
      ).map((n) => (
        <span key={n} title={n} className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-card">
          <Icon name={n} />
        </span>
      ))}
    </div>
  ),
  ScoreRing: ScoreDemo,
  StreamText: StreamDemo,
  Alert: () => (
    <div className="grid gap-2">
      <Alert>Your CV is read on your device.</Alert>
      <Alert tone="error">We couldn&apos;t read text from this PDF.</Alert>
    </div>
  ),
  Dialog: DialogDemo,
  ScanBar: () => <ScanBar label="Reading your CV" />,
  NumberTicker: () => (
    <p className="text-3xl font-extrabold">
      <NumberTicker value={14} suffix="/18" />
    </p>
  ),
  Confetti: ConfettiDemo,
};

/** Renders the live demo for a registry entry. A component, so the server page can render it. */
export function Demo({ name }: { name: string }) {
  const Render = DEMOS[name];
  return Render ? <Render /> : null;
}
