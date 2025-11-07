import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  sendOfficenextMessage,
  sendOfficenextNotification,
} from "@/lib/officenext";

export async function POST(req: NextRequest) {
  try {
    const { adminId, adminEmail, inquiryId } = await req.json();

    if (!adminId || !adminEmail || !inquiryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Defaults when no explicit settings exist
    let receive_notifications = true;
    let notify_email = true;
    let notify_message = false;
    let notify_notification = false;

    // Try fetch admin_settings by user_id (use admin client to bypass RLS)
    try {
      const adminClient = createAdminClient();
      const { data: settings, error: settingsError } = await adminClient
        .from("admin_settings")
        .select(
          "receive_notifications, notify_email, notify_message, notify_notification"
        )
        .eq("user_id", adminId)
        .single();
      if (settingsError) {
        console.warn("admin_settings select error:", settingsError);
      }
      if (settings) {
        receive_notifications = settings.receive_notifications ?? true;
        notify_email = settings.notify_email ?? true;
        notify_message = settings.notify_message ?? false;
        notify_notification = settings.notify_notification ?? false;
      }
    } catch (e) {
      console.warn("admin_settings lookup failed; using defaults");
    }

    // If master off, skip all
    if (!receive_notifications) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "receive_notifications is false",
      });
    }

    // Build common values
    const adminSiteUrl =
      process.env.ADMIN_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    // Officenext: message supports HTML (<br>), notification prefers plain text with \n\n
    const messageContents =
      `📩 지란지교패밀리 윤리경영 상담관리센터에 새로운 제보가 접수되었습니다.` +
      `<br><br>🔗 제보 내용 확인하기: <a href="${adminSiteUrl}">${adminSiteUrl}</a>`;
    const notificationContents = `📩 지란지교패밀리 윤리경영 상담관리센터에 새로운 제보가 접수되었습니다.\n\n🔗 제보 내용 확인하기: ${adminSiteUrl}`;

    // Prepare tasks by channel
    const tasks: Promise<any>[] = [];

    if (notify_email) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      tasks.push(
        fetch(`${baseUrl}/api/email/send-admin-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminEmail }),
        })
      );
    }

    if (notify_message) {
      tasks.push(
        sendOfficenextMessage({
          to: [adminEmail],
          contents: messageContents,
          important: true,
        })
      );
    }

    if (notify_notification) {
      tasks.push(
        sendOfficenextNotification({
          to: [adminEmail],
          title: `[새 제보] 지란지교패밀리 윤리경영 상담센터에 새로운 제보가 접수되었습니다.`,
          contents: notificationContents,
          important: true,
        })
      );
    }

    const results = await Promise.allSettled(tasks);
    const fulfilled = results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
    const okCount = fulfilled.filter((r) => (r.value as any)?.ok !== false).length; // fetch Response or undefined
    const rejected = results.length - fulfilled.length;
    console.log('[Notify][admin]', {
      adminId,
      adminEmail,
      channels: {
        email: notify_email,
        message: notify_message,
        notification: notify_notification,
      },
      tasks: results.length,
      ok: okCount,
      rejected,
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Notification dispatch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
