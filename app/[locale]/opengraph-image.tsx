import { ImageResponse } from "next/og";

// The card shown when a JobFit link is shared (LinkedIn, WhatsApp). ImageResponse only understands
// inline styles, so this file is the one exception to the no-inline-style and token rules.
export const alt = "JobFit — does your CV fit the job?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0f1f3d";
const SUBTITLE = "Match score in seconds · AI cover letter · your CV stays private";
const TEXT = `JobFitDoes your CV fit the job?${SUBTITLE}`;

// Loads just the glyphs we need from Google Fonts; falls back to the default font if offline
async function syne(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Syne:wght@800&text=${encodeURIComponent(TEXT)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await syne();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#d7f5e6",
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, fontFamily: "Syne" }}>
          Job
          <span
            style={{
              marginLeft: 6,
              padding: "0 10px",
              background: "#ff5c8a",
              color: "white",
              border: `4px solid ${INK}`,
              borderRadius: 10,
            }}
          >
            Fit
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 96,
            fontWeight: 800,
            fontFamily: "Syne",
            marginTop: 40,
            lineHeight: 1,
            letterSpacing: -3,
          }}
        >
          Does your CV fit the job?
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 34, color: "#3b4a66", fontFamily: "Syne" }}>
          {SUBTITLE}
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Syne", data: font, weight: 800, style: "normal" }] : [] },
  );
}
