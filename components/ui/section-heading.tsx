import type { ReactNode } from "react";

type Props = { eyebrow?: string; title: ReactNode; description?: ReactNode; as?: "h1" | "h2" };

export function SectionHeading({ eyebrow, title, description, as: Tag = "h2" }: Props) {
  return (
    <div data-ui="SectionHeading" className="min-w-0">
      {eyebrow && <p className="mb-2 font-display text-xs font-extrabold tracking-widest uppercase">{eyebrow}</p>}
      <Tag
        className={
          Tag === "h1"
            ? "font-display text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            : "font-display text-2xl font-extrabold tracking-tight sm:text-3xl"
        }
      >
        {title}
      </Tag>
      {description && <p className="mt-3 max-w-xl text-base text-ink-soft">{description}</p>}
    </div>
  );
}
