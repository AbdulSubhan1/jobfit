type Props = { text: string; streaming: boolean };

/** AI output as it arrives, with a blinking caret while streaming. */
export function StreamText({ text, streaming }: Props) {
  return (
    <div
      data-ui="StreamText"
      aria-live="polite"
      aria-busy={streaming}
      className="text-[15px] leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap"
    >
      {text}
      {streaming && <span aria-hidden className="ms-0.5 inline-block h-4 w-2 animate-caret bg-pop align-middle" />}
    </div>
  );
}
