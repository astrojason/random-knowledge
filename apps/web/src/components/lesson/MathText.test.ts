// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { MathText } from "./MathText";

function render(text: string) {
  const container = document.createElement("div");
  act(() => createRoot(container).render(createElement(MathText, { text })));
  return container;
}

describe("MathText", () => {
  it("renders LaTeX spans with KaTeX and keeps the surrounding text", () => {
    const container = render(String.raw`Odds: \(\frac{1}{2}\) each.`);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.textContent).toContain("Odds:");
    expect(container.querySelector(".katex-html")?.textContent).not.toContain("\\frac");
  });

  it("falls back to the plain-text form and logs when KaTeX can't parse the math", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = render(String.raw`Bad: \(\frac{1}{\)`);
    expect(container.querySelector(".katex")).toBeNull();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
