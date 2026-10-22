import katex from "katex";
import "katex/dist/katex.min.css";
import { plainMath, splitMath } from "@/lib/math";

function renderMath(value: string, display: boolean): string | null {
  try {
    return katex.renderToString(value, { displayMode: display, throwOnError: true });
  } catch (err) {
    console.error(`KaTeX could not render "${value}"`, err);
    return null;
  }
}

/** Lesson text with its LaTeX spans rendered by KaTeX; math KaTeX rejects falls back to plain text. */
export function MathText({ text }: { text: string }) {
  return splitMath(text).map((segment, i) => {
    if (segment.type === "text") return segment.value;
    const html = renderMath(segment.value, segment.display);
    return html
      ? <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
      : plainMath(segment.value);
  });
}
