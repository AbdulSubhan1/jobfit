type Props = { label: string };

/** A sweeping bar for work in progress, e.g. reading a PDF. */
export function ScanBar({ label }: Props) {
  return (
    <div
      data-ui="ScanBar"
      role="progressbar"
      aria-label={label}
      className="relative h-2 w-full overflow-hidden rounded-full border-2 border-ink bg-card"
    >
      <div className="absolute inset-y-0 w-2/5 animate-scan rounded-full bg-pop" />
    </div>
  );
}
