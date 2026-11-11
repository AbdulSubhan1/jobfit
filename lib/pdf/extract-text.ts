import { LIMITS } from "@/constants/config";

export class PdfError extends Error {
  constructor(public readonly reason: "empty" | "too-big" | "not-pdf") {
    super(reason);
  }
}

/** Reads a PDF's text in the browser. The file never leaves the device. */
export async function extractPdfText(file: File): Promise<string> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new PdfError("not-pdf");
  if (file.size > LIMITS.pdfBytes) throw new PdfError("too-big");

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let doc;
  try {
    doc = await task.promise;
  } catch {
    throw new PdfError("not-pdf");
  }

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    let page = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      page += item.str + (item.hasEOL ? "\n" : "");
    }
    pages.push(page);
  }
  await task.destroy();

  // Collapse the runs of spaces PDFs produce, keep line breaks
  const text = pages
    .join("\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  // Scanned PDFs are images: almost no text comes out
  if (text.replace(/\s/g, "").length < 40) throw new PdfError("empty");
  return text;
}
