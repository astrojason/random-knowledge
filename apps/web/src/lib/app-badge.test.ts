import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncAppBadge } from "./app-badge";

describe("syncAppBadge", () => {
  let setAppBadge: ReturnType<typeof vi.fn>;
  let clearAppBadge: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setAppBadge = vi.fn().mockResolvedValue(undefined);
    clearAppBadge = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "setAppBadge", { value: setAppBadge, configurable: true });
    Object.defineProperty(navigator, "clearAppBadge", { value: clearAppBadge, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).setAppBadge;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).clearAppBadge;
  });

  it("sets a badge when a lesson is pending", () => {
    syncAppBadge(true);
    expect(setAppBadge).toHaveBeenCalledWith(1);
    expect(clearAppBadge).not.toHaveBeenCalled();
  });

  it("clears the badge when nothing is pending", () => {
    syncAppBadge(false);
    expect(clearAppBadge).toHaveBeenCalled();
    expect(setAppBadge).not.toHaveBeenCalled();
  });

  it("does nothing when the Badging API is unsupported", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).setAppBadge;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).clearAppBadge;
    expect(() => syncAppBadge(true)).not.toThrow();
  });

  it("logs an error if setting the badge rejects", async () => {
    const error = new Error("denied");
    setAppBadge.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    syncAppBadge(true);
    await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Failed to update app badge:", error));
  });
});
