import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendOfficenextMessage,
  sendOfficenextNotification,
} from "@/lib/officenext";

export async function POST(req: NextRequest) {
  try {
    const {
      adminId,
      adminEmail,
      inquiryId,
      title,
      name,
      email,
      phone,
      content,
    } = await req.json();

    if (!adminId || !adminEmail || !inquiryId || !title || !name || !email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Defaults when no explicit settings exist
    let receive_notifications = true;
    let notify_email = true;
    let notify_message = false;
    let notify_notification = false;

    // Try fetch admin_settings by user_id
    try {
      const supabase = await createClient();
      const { data: settings } = await supabase
        .from("admin_settings")
        .select("receive_notifications, notify_email, notify_message, notify_notification")
        .eq("user_id", adminId)
        .single();
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
      process.env.ADMIN_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const contentPreview = content.length > 100 ? content.substring(0, 100) + "..." : content;
    const summary = `제보 제목: ${title}\n제보자: ${name} <${email}>${phone ? ` (${phone})` : ""}\n내용: ${contentPreview}\n관리: ${adminSiteUrl}`;

    // Prepare tasks by channel
    const tasks: Promise<any>[] = [];

    if (notify_email) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      tasks.push(
        fetch(`${baseUrl}/api/email/send-admin-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminEmail, inquiryId, title, name, email, phone, content }),
        })
      );
    }

    if (notify_message) {
      tasks.push(
        sendOfficenextMessage({ to: [adminEmail], content: summary, important: true })
      );
    }

    if (notify_notification) {
      tasks.push(
        sendOfficenextNotification({
          to: [adminEmail],
          title: `[새 제보] ${title}`,
          content: summary,
          important: true,
        })
      );
    }

    const results = await Promise.allSettled(tasks);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Notification dispatch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

