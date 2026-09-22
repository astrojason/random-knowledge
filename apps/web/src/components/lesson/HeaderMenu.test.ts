// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HeaderMenu } from "./HeaderMenu";

let container: HTMLDivElement;
let root: Root;

function openButton() {
  return container.querySelector('button[aria-label="Open menu"]') as HTMLButtonElement;
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

it("is closed by default and opens on click", async () => {
  await act(async () => {
    root.render(createElement(HeaderMenu, { showCategoriesSetting: false, categoryCount: 0, onEditCategories: vi.fn() }));
  });
  expect(openButton().getAttribute("aria-expanded")).toBe("false");

  await act(async () => openButton().click());
  expect(openButton().getAttribute("aria-expanded")).toBe("true");
  expect(container.textContent).toContain("Library");
});

it("hides the Settings section until categories are editable", async () => {
  await act(async () => {
    root.render(createElement(HeaderMenu, { showCategoriesSetting: false, categoryCount: 2, onEditCategories: vi.fn() }));
  });
  expect(container.textContent).not.toContain("Settings");
  expect(container.textContent).not.toContain("My categories");
});

it("choosing My categories notifies the parent and closes the menu", async () => {
  const onEditCategories = vi.fn();
  await act(async () => {
    root.render(createElement(HeaderMenu, { showCategoriesSetting: true, categoryCount: 3, onEditCategories }));
  });
  await act(async () => openButton().click());

  const categoriesButton = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("My categories"))!;
  await act(async () => categoriesButton.click());

  expect(onEditCategories).toHaveBeenCalledOnce();
  expect(openButton().getAttribute("aria-expanded")).toBe("false");
});

it("closes on Escape", async () => {
  await act(async () => {
    root.render(createElement(HeaderMenu, { showCategoriesSetting: false, categoryCount: 0, onEditCategories: vi.fn() }));
  });
  await act(async () => openButton().click());
  expect(openButton().getAttribute("aria-expanded")).toBe("true");

  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });
  expect(openButton().getAttribute("aria-expanded")).toBe("false");
});
