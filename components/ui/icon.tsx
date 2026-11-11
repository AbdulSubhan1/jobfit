import { cn } from "@/lib/cn";

// Stroke icons on a 24px grid. Add new ones here; icon packages are blocked.
const STROKE = {
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  file: "M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  copy: "M9 9h10v10H9zM5 15V5h10",
  download: "M12 4v12M7 11l5 5 5-5M4 20h16",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  check: "M5 12l5 5L20 7",
  x: "M6 6l12 12M18 6L6 18",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
  text: "M4 6h16M4 12h16M4 18h10",
} as const;

// Brand marks keep their official colours; this is the one place hex values are allowed outside @theme.
const GITHUB =
  "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56l-.02-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14l-.01 3.18c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z";
const GOOGLE: [string, string][] = [
  [
    "#4285F4",
    "M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.82z",
  ],
  [
    "#34A853",
    "M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.1A12 12 0 0 0 12 24z",
  ],
  ["#FBBC05", "M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.26a12 12 0 0 0 0 10.78z"],
  [
    "#EA4335",
    "M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.26 6.61l4.01 3.1C6.22 6.87 8.87 4.76 12 4.76z",
  ],
];

// Icons that point somewhere mirror in right-to-left languages
const DIRECTIONAL = new Set<string>(["arrow-right", "logout"]);

export type IconName = keyof typeof STROKE | "github" | "google";

type Props = { name: IconName; size?: number; className?: string; label?: string };

export function Icon({ name, size = 18, className, label }: Props) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const common = {
    "data-ui": "Icon",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: cn("shrink-0", DIRECTIONAL.has(name) && "rtl:-scale-x-100", className),
  };
  if (name === "github") {
    return (
      <svg {...common} {...a11y} fill="currentColor">
        <path d={GITHUB} />
      </svg>
    );
  }
  if (name === "google") {
    return (
      <svg {...common} {...a11y}>
        {GOOGLE.map(([fill, d]) => (
          <path key={fill} fill={fill} d={d} />
        ))}
      </svg>
    );
  }
  return (
    <svg
      {...common}
      {...a11y}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={STROKE[name]} />
    </svg>
  );
}
