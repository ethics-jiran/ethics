import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "토큰과 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 토큰 검증 (Admin 클라이언트 사용 - RLS 우회)
    const { data: resetToken, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 400 }
      );
    }

    // 만료 확인
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "토큰이 만료되었습니다" },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Failed to list users:", usersError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const user = users.find(u => u.email === resetToken.email);

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 비밀번호 업데이트
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        { error: "비밀번호 변경에 실패했습니다" },
        { status: 500 }
      );
    }

    // 토큰 사용 처리 (Admin 클라이언트 사용 - RLS 우회)
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("token", token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
