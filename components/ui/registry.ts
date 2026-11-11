// Machine-readable catalogue of the UI library. The /design page renders it, and AI agents
// should read it before building UI. Add an entry here whenever a component is added to components/ui.

export const UI_GROUPS = ["Actions", "Inputs", "Display", "Feedback", "Motion"] as const;

export type RegistryEntry = {
  name: string;
  file: string;
  group: (typeof UI_GROUPS)[number];
  description: string;
  props: string;
  example: string;
};

export const UI_REGISTRY: RegistryEntry[] = [
  // Actions
  {
    name: "Button",
    file: "button.tsx",
    group: "Actions",
    description: "Every clickable action. Lifts on hover, presses flat on click. Pick a variant; never restyle.",
    props: 'variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg"; plus <button> props',
    example: '<Button variant="primary">Check match</Button>',
  },
  {
    name: "ButtonLink",
    file: "button-link.tsx",
    group: "Actions",
    description: "A locale-aware link that looks like a Button, for navigation.",
    props: "href; variant?; size?",
    example: '<ButtonLink href="/check" variant="primary">Check my CV</ButtonLink>',
  },
  {
    name: "Tabs",
    file: "tabs.tsx",
    group: "Actions",
    description: "Segmented tabs with arrow-key support (RTL aware). Panels use id `panel-<id>`.",
    props: "items: {id, label}[]; value; onChange(id); label",
    example: '<Tabs label="AI tools" items={tools} value={tab} onChange={setTab} />',
  },
  // Inputs
  {
    name: "Textarea",
    file: "textarea.tsx",
    group: "Inputs",
    description: "Multi-line text input in the bold-pop style.",
    props: "rows?: number (default 8); plus <textarea> props",
    example: '<Textarea placeholder="Paste the job description" />',
  },
  {
    name: "FileDrop",
    file: "file-drop.tsx",
    group: "Inputs",
    description: "Drag-and-drop or click-to-pick file zone, with a scan bar while busy.",
    props: "accept; onFile(file); label; hint; fileName?; busy?; busyLabel",
    example:
      '<FileDrop accept="application/pdf" onFile={read} label="Drop your CV" hint="PDF, up to 5 MB" busyLabel="Reading" />',
  },
  // Display
  {
    name: "Logo",
    file: "logo.tsx",
    group: "Display",
    description: "The JobFit wordmark.",
    props: 'size?: "md" | "lg"',
    example: "<Logo />",
  },
  {
    name: "SectionHeading",
    file: "section-heading.tsx",
    group: "Display",
    description: 'Eyebrow, title and description. Use as="h1" once per page for the hero.',
    props: 'eyebrow?; title; description?; as?: "h1" | "h2"',
    example: '<SectionHeading as="h1" title="Does your CV fit the job?" />',
  },
  {
    name: "Card",
    file: "card.tsx",
    group: "Display",
    description: "Thick-outlined surface with a hard shadow. Optional floating motion and corner sticker.",
    props: 'tone?: "white" | "paper"; float?: boolean; sticker?: ReactNode',
    example: "<Card float sticker={<Sticker>100% private</Sticker>}>…</Card>",
  },
  {
    name: "Chip",
    file: "chip.tsx",
    group: "Display",
    description: "A skill tag. Green = in your CV, pink = missing. Pops in; pass delay for a staggered row.",
    props: 'tone?: "have" | "miss" | "neutral"; delay?: number; onClick?; pressed?',
    example: '<Chip tone="have" delay={120}>React</Chip>',
  },
  {
    name: "Sticker",
    file: "sticker.tsx",
    group: "Display",
    description: "A wobbling badge for short claims.",
    props: 'tone?: "sun" | "pop"',
    example: "<Sticker>100% private</Sticker>",
  },
  {
    name: "Icon",
    file: "icon.tsx",
    group: "Display",
    description: "Stroke icons on a 24px grid plus the Google and GitHub marks. Add paths in icon.tsx.",
    props: "name: IconName; size?: number; label? (omit for decorative)",
    example: '<Icon name="lock" />',
  },
  {
    name: "ScoreRing",
    file: "score-ring.tsx",
    group: "Display",
    description: "The match score: the ring fills and the number counts up. null shows a dashed “can't score” ring.",
    props: 'value: number | null; size?: "md" | "lg"; label',
    example: '<ScoreRing value={72} label="Match score" />',
  },
  {
    name: "StreamText",
    file: "stream-text.tsx",
    group: "Display",
    description: "AI output as it arrives, with a blinking caret while streaming.",
    props: "text; streaming: boolean",
    example: "<StreamText text={output} streaming={busy} />",
  },
  // Feedback
  {
    name: "Alert",
    file: "alert.tsx",
    group: "Feedback",
    description: "Inline message. Error is announced immediately; info politely.",
    props: 'tone?: "info" | "error"',
    example: '<Alert tone="error">We couldn\'t read text from this PDF.</Alert>',
  },
  {
    name: "Dialog",
    file: "dialog.tsx",
    group: "Feedback",
    description: "Modal on the native <dialog>: focus trap, Escape and backdrop click close it.",
    props: "open; onClose(); title; closeLabel",
    example: '<Dialog open={open} onClose={close} title="What the AI will see" closeLabel="Close">…</Dialog>',
  },
  {
    name: "ScanBar",
    file: "scan-bar.tsx",
    group: "Feedback",
    description: "Indeterminate progress bar that sweeps across.",
    props: "label",
    example: '<ScanBar label="Reading your CV" />',
  },
  // Motion
  {
    name: "NumberTicker",
    file: "number-ticker.tsx",
    group: "Motion",
    description: "Counts up to a value in DM Sans with tabular digits.",
    props: "value: number; suffix?; duration?",
    example: '<NumberTicker value={14} suffix="/18" />',
  },
  {
    name: "Confetti",
    file: "confetti.tsx",
    group: "Motion",
    description: "A one-off celebration burst when fire turns true (score ≥ 80). Off under reduced motion.",
    props: "fire: boolean",
    example: "<Confetti fire={score >= 80} />",
  },
];
