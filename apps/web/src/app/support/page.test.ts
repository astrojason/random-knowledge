import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import SupportPage from "./page";

it("shows how to reach support and answers the common questions", () => {
  const html = renderToStaticMarkup(createElement(SupportPage));

  expect(html).toContain("Support");
  expect(html).toContain('href="mailto:jason@astrojason.com"');
  expect(html).toContain("Access requested");
  expect(html).toContain('href="/privacy"');
  expect(html).toContain('href="/terms"');
});
