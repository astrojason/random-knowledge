import { describe, expect, it } from "vitest";
import { hasAppAccess, isSuperadmin, requestsForAdmin, resolveAccess, type AccessRequest } from "./auth-guard";

describe("isSuperadmin", () => {
  it("is true when the superadmin claim is set", () => {
    expect(isSuperadmin({ superadmin: true })).toBe(true);
  });

  it("is false when the claim is absent, false, or claims are missing", () => {
    expect(isSuperadmin({})).toBe(false);
    expect(isSuperadmin({ superadmin: false })).toBe(false);
    expect(isSuperadmin(null)).toBe(false);
    expect(isSuperadmin(undefined)).toBe(false);
  });
});

describe("resolveAccess", () => {
  const request = (status: AccessRequest["status"]): AccessRequest => ({
    uid: "u1",
    email: "u1@example.com",
    displayName: "U1",
    status,
    firstSeenAt: "2026-09-01",
    lastSeenAt: "2026-09-01",
  });

  it("denies signed-out users", () => {
    expect(resolveAccess(null, null, null)).toBe("denied");
  });

  it("resolves superadmin regardless of any request doc", () => {
    expect(resolveAccess("u1", { superadmin: true }, null)).toBe("superadmin");
    expect(resolveAccess("u1", { superadmin: true }, request("revoked"))).toBe("superadmin");
  });

  it("treats a missing request as pending", () => {
    expect(resolveAccess("u1", {}, null)).toBe("pending");
  });

  it("passes through the request's status", () => {
    expect(resolveAccess("u1", {}, request("pending"))).toBe("pending");
    expect(resolveAccess("u1", {}, request("granted"))).toBe("granted");
    expect(resolveAccess("u1", {}, request("revoked"))).toBe("revoked");
  });
});

describe("requestsForAdmin", () => {
  const request = (uid: string, status: AccessRequest["status"] = "pending"): AccessRequest => ({
    uid,
    email: `${uid}@example.com`,
    displayName: uid,
    status,
    firstSeenAt: "2026-09-01",
    lastSeenAt: "2026-09-01",
  });

  it("excludes the viewer's own request, e.g. a leftover doc from before they became superadmin", () => {
    const requests = [request("admin-uid"), request("u1"), request("u2", "granted")];
    expect(requestsForAdmin(requests, "admin-uid")).toEqual([request("u1"), request("u2", "granted")]);
  });

  it("leaves the list unchanged when the viewer has no request of their own", () => {
    const requests = [request("u1"), request("u2")];
    expect(requestsForAdmin(requests, "admin-uid")).toEqual(requests);
  });
});

describe("hasAppAccess", () => {
  it("is true only for superadmin and granted", () => {
    expect(hasAppAccess("superadmin")).toBe(true);
    expect(hasAppAccess("granted")).toBe(true);
    expect(hasAppAccess("pending")).toBe(false);
    expect(hasAppAccess("revoked")).toBe(false);
    expect(hasAppAccess("denied")).toBe(false);
  });
});
