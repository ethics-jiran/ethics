export type OfficenextMessagePayload = {
  to: string[];
  content: string;
  important?: boolean;
};

export type OfficenextNotificationPayload = {
  to: string[];
  title: string;
  content: string;
  important?: boolean;
};

export async function sendOfficenextMessage(payload: OfficenextMessagePayload) {
  const token = process.env.OFFICENEXT_HOOK_TOKEN;
  if (!token) {
    console.warn("Officenext token not set; skipping message send");
    return { ok: false, status: 0 };
  }
  try {
    const res = await fetch(
      `https://jiran-api.officewave.co.kr/api/v1/hooks/${token}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return { ok: res.ok, status: res.status };
  } catch (e) {
    console.error("Officenext message send failed:", e);
    return { ok: false, status: 0 };
  }
}

export async function sendOfficenextNotification(
  payload: OfficenextNotificationPayload
) {
  const token = process.env.OFFICENEXT_HOOK_TOKEN;
  if (!token) {
    console.warn("Officenext token not set; skipping notification send");
    return { ok: false, status: 0 };
  }
  try {
    const res = await fetch(
      `https://jiran-api.officewave.co.kr/api/v1/hooks/${token}/notifications`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return { ok: res.ok, status: res.status };
  } catch (e) {
    console.error("Officenext notification send failed:", e);
    return { ok: false, status: 0 };
  }
}

