import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 사용자 확인
    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Failed to list users:", usersError);
      // 보안상 사용자가 없어도 성공 메시지 반환
      return NextResponse.json({ success: true });
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      // 보안상 사용자가 없어도 성공 메시지 반환
      return NextResponse.json({ success: true });
    }

    // 재설정 토큰 생성 (1시간 유효)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1시간

    // 토큰 저장 (Admin 클라이언트 사용 - RLS 우회)
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to save reset token:", insertError);
      return NextResponse.json(
        { error: "비밀번호 재설정 요청에 실패했습니다" },
        { status: 500 }
      );
    }

    // 이메일 전송 API 호출
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/email/send-reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          resetToken,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send reset email");
      return NextResponse.json(
        { error: "비밀번호 재설정 이메일 전송에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
