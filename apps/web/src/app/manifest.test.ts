import { expect, it } from "vitest";
import manifest from "./manifest";

it("describes an installable standalone app with required icons", () => {
  const value = manifest();

  expect(value).toMatchObject({
    name: "Random Knowledge",
    start_url: "/",
    scope: "/",
    display: "standalone",
  });
  expect(value.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", type: "image/png" }),
      expect.objectContaining({ sizes: "512x512", type: "image/png", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", type: "image/png", purpose: "maskable" }),
    ]),
  );
});
