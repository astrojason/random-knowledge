export type MathSegment = { type: "text"; value: string } | { type: "math"; value: string; display: boolean };

const MATH_SPAN = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;

/** Splits lesson text into plain text and LaTeX math (`\( … \)` inline, `\[ … \]` display). */
export function splitMath(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(MATH_SPAN)) {
    if (match.index > last) segments.push({ type: "text", value: text.slice(last, match.index) });
    segments.push({ type: "math", value: (match[1] ?? match[2]).trim(), display: match[2] !== undefined });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}

/** Plain-text form of LaTeX in `text`, for read-aloud and for surfaces that can't render math. */
export function plainMath(text: string): string {
  return text
    .replace(/\\[()[\]]/g, "")
    .replace(/\\(?:text|mathrm)\{([^{}]*)\}/g, "$1")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
    .replace(/\s*\\cdots\s*/g, " × … × ")
    .replace(/\s*\\(?:cdot|times)\s*/g, " × ")
    .replace(/\s*\\approx\s*/g, " ≈ ")
    .replace(/\s*\\leq?\s*/g, " ≤ ")
    .replace(/\s*\\geq?\s*/g, " ≥ ");
}
