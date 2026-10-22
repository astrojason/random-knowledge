import { describe, expect, it } from "vitest";
import { plainMath, splitMath } from "./math";

describe("splitMath", () => {
  it("separates inline and display math from the surrounding text", () => {
    expect(splitMath(String.raw`Odds are \(1 - 0.49\) overall, or \[x^2\] shown.`)).toEqual([
      { type: "text", value: "Odds are " },
      { type: "math", value: "1 - 0.49", display: false },
      { type: "text", value: " overall, or " },
      { type: "math", value: "x^2", display: true },
      { type: "text", value: " shown." },
    ]);
  });

  it("leaves text with no math, or an unclosed delimiter, as a single text segment", () => {
    expect(splitMath("Plain text.")).toEqual([{ type: "text", value: "Plain text." }]);
    expect(splitMath(String.raw`Broken \(x`)).toEqual([{ type: "text", value: String.raw`Broken \(x` }]);
  });
});

describe("plainMath", () => {
  it("converts LaTeX math to readable plain text", () => {
    expect(plainMath(String.raw`So \(P(\text{all distinct}) = \frac{365}{365} \cdot \frac{364}{365} \cdots \frac{343}{365}\approx 0.4927\), calculated as \(1 - 0.4927\).`))
      .toBe("So P(all distinct) = 365/365 × 364/365 × … × 343/365 ≈ 0.4927, calculated as 1 - 0.4927.");
  });
});
