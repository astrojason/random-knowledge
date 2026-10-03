import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import Home from "./page";
import AdminLayout from "./admin/layout";
import { useAuth } from "@/lib/auth-context";
import { useAccessStatus } from "@/lib/useAccessStatus";

vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }));
vi.mock("@/lib/useAccessStatus", () => ({ useAccessStatus: vi.fn() }));
vi.mock("@/lib/firestore", () => ({ grantAccess: vi.fn(), listAccessRequests: vi.fn(), revokeAccess: vi.fn(), setAutoGeneration: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/access" }));
vi.mock("@/components/lesson/DailyLesson", () => ({ DailyLesson: () => "Daily lesson" }));
vi.mock("@/components/LandingPage", () => ({ LandingPage: () => "Public landing page" }));

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ user: { uid: "reader", email: "reader@example.com" }, claims: {}, loading: false, signOut: vi.fn() } as unknown as ReturnType<typeof useAuth>);
  vi.mocked(useAccessStatus).mockReturnValue({ status: "pending", loading: false });
});

it("shows the public page while signed-out auth initializes", () => {
  vi.mocked(useAuth).mockReturnValue({ ...useAuth(), user: null, loading: true });
  expect(renderToStaticMarkup(createElement(Home))).toBe("Public landing page");
});

it.each(["pending", "revoked", "granted"] as const)("renders the home access state %s", (status) => {
  vi.mocked(useAccessStatus).mockReturnValue({ status, loading: false });
  const html = renderToStaticMarkup(createElement(Home));
  expect(html).toContain({ pending: "Access requested", revoked: "Access revoked", granted: "Daily lesson" }[status]);
});

it("waits for access before showing the lesson", () => {
  vi.mocked(useAccessStatus).mockReturnValue({ status: "granted", loading: true });
  const html = renderToStaticMarkup(createElement(Home));
  expect(html).toContain("Loading");
  expect(html).not.toContain("Daily lesson");
});

const adminSection = () => renderToStaticMarkup(createElement(AdminLayout, null, "Admin page content"));

it("denies every admin section to a normal signed-in user", () => {
  const html = adminSection();
  expect(html).toContain("Access requested");
  expect(html).not.toContain("Admin page content");
  expect(html).not.toContain("Manage access");
});

it("shows the admin section and its navigation to a superadmin", () => {
  vi.mocked(useAuth).mockReturnValue({ ...useAuth(), claims: { superadmin: true } });
  const html = adminSection();
  expect(html).toContain("Admin page content");
  for (const link of ["Manage access", "Generation log", "Cron run log"]) expect(html).toContain(link);
});
