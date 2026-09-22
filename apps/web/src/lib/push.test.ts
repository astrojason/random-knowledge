import { beforeEach, expect, it, vi } from "vitest";
import { sendBadgePush } from "./push";

beforeEach(() => vi.resetAllMocks());

it("sends a silent, badge-only push to Expo's push service", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ status: "ok" }] }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);

  await sendBadgePush("ExponentPushToken[abc]", 1);

  expect(fetchMock).toHaveBeenCalledWith(
    "https://exp.host/--/api/v2/push/send",
    expect.objectContaining({ method: "POST" })
  );
  const [, init] = fetchMock.mock.calls[0];
  const [message] = JSON.parse(init.body);
  expect(message).toMatchObject({ to: "ExponentPushToken[abc]", badge: 1, _contentAvailable: true });
  expect(message.title).toBeUndefined();
  expect(message.body).toBeUndefined();
  expect(message.sound).toBeUndefined();
});

it("throws when Expo rejects the request", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bad token", { status: 400 })));
  await expect(sendBadgePush("not-a-token", 1)).rejects.toThrow(/bad token/);
});

it("throws when Expo accepts the request but the ticket reports an error", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ status: "error", message: "DeviceNotRegistered" }] }), { status: 200 }))
  );
  await expect(sendBadgePush("stale-token", 1)).rejects.toThrow(/DeviceNotRegistered/);
});
