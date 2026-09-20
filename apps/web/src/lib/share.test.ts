import { expect, it } from "vitest";
import { shareMessage, shareUrl } from "./share";

it("builds a share link without doubling slashes", () => {
  expect(shareUrl("https://example.com/", "abc")).toBe("https://example.com/share/abc");
  expect(shareUrl("https://example.com", "abc")).toBe("https://example.com/share/abc");
});

it("names the sender in the invite when known", () => {
  expect(shareMessage("Newton", "Ada")).toContain("Ada thought you'd like");
  expect(shareMessage("Newton", null)).toContain("Thought you'd like");
  expect(shareMessage("Newton", "Ada")).toContain("“Newton”");
});
