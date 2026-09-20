import { beforeEach, expect, it, vi } from "vitest";
import { GET } from "./route";
import { getSharePreviewAdmin } from "@/lib/firebase-admin";

vi.mock("@/lib/firebase-admin", () => ({ getSharePreviewAdmin: vi.fn() }));

const call = (id: string) => GET(new Request(`http://localhost/api/share/${id}`), { params: Promise.resolve({ id }) });

beforeEach(() => vi.resetAllMocks());

it("returns only the preview fields of a share, never the lesson body", async () => {
  vi.mocked(getSharePreviewAdmin).mockResolvedValue({ title: "Newton", category: "physics", ownerName: "Ada" });
  const response = await call("abc");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ title: "Newton", category: "physics", ownerName: "Ada" });
  expect(getSharePreviewAdmin).toHaveBeenCalledWith("abc");
});

it("404s an unknown share", async () => {
  vi.mocked(getSharePreviewAdmin).mockResolvedValue(null);
  expect((await call("nope")).status).toBe(404);
});

it("reports lookup failures instead of hiding them", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(getSharePreviewAdmin).mockRejectedValue(new Error("boom"));
  const response = await call("abc");
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "boom" });
});
