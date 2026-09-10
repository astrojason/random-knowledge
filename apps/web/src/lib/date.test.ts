import { afterEach, describe, expect, it, vi } from "vitest";
import { daysAgoStr, todayStr } from "./date";

afterEach(() => vi.useRealTimers());

describe("local lesson dates", () => {
  it("keeps a Los Angeles evening on the previous UTC date", () => {
    expect(todayStr("America/Los_Angeles", new Date("2026-09-11T02:00:00Z"))).toBe("2026-09-10");
  });
  it("uses the next day for a timezone east of UTC", () => {
    expect(todayStr("Asia/Tokyo", new Date("2026-09-10T16:00:00Z"))).toBe("2026-09-11");
  });
  it("supports fractional-hour offsets", () => {
    expect(todayStr("Asia/Kathmandu", new Date("2026-09-10T18:30:00Z"))).toBe("2026-09-11");
  });
  it("switches exactly at local midnight", () => {
    expect(todayStr("America/Los_Angeles", new Date("2026-09-11T06:59:59Z"))).toBe("2026-09-10");
    expect(todayStr("America/Los_Angeles", new Date("2026-09-11T07:00:00Z"))).toBe("2026-09-11");
  });
  it("handles spring-forward and fall-back offsets", () => {
    expect(todayStr("America/Los_Angeles", new Date("2026-03-09T07:00:00Z"))).toBe("2026-03-09");
    expect(todayStr("America/Los_Angeles", new Date("2026-11-02T07:30:00Z"))).toBe("2026-11-01");
  });
  it("defaults to the device's timezone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T02:00:00Z"));
    expect(todayStr()).toBe(todayStr(Intl.DateTimeFormat().resolvedOptions().timeZone));
  });
  it("subtracts calendar days rather than 24-hour periods across DST", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-02T07:30:00Z"));
    expect(daysAgoStr(1, "America/Los_Angeles")).toBe("2026-10-31");
  });
});
