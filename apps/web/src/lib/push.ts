const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushTicket {
  status: "ok" | "error";
  message?: string;
}

/**
 * Sends a silent, badge-only push through Expo's push service, so the mobile
 * app's icon badge updates to reflect an unread lesson without the app being
 * open. No title/body/sound is set, so it never shows an alert or plays a sound.
 */
export async function sendBadgePush(expoPushToken: string, badge: number): Promise<void> {
  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify([{ to: expoPushToken, badge, _contentAvailable: true, priority: "normal" }]),
  });
  if (!res.ok) throw new Error(`Expo push request failed: ${res.status} ${await res.text()}`);

  const body = (await res.json()) as { data?: ExpoPushTicket[] };
  const ticket = body.data?.[0];
  if (ticket?.status === "error") throw new Error(`Expo push ticket error: ${ticket.message ?? "unknown"}`);
}
