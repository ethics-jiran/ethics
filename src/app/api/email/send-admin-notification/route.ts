import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { adminEmail, inquiryId, title, name, email, phone, content } =
      await req.json();

    // Validate required fields
    if (!adminEmail || !inquiryId || !title || !name || !email || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // SMTP configuration
    const smtpHostname = process.env.SMTP_HOSTNAME;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUsername;

    if (!smtpHostname || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error("SMTP configuration not complete");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHostname,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Get base URL for the management link
    const baseUrl =
      process.env.ADMIN_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Truncate content to 100 characters
    const contentPreview =
      content.length > 100 ? content.substring(0, 100) + "..." : content;

    const htmlContent = `<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body
    style="margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h1
                                style="color: #111827; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.56px;">
                                새로운 제보가 등록되었습니다
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p
                                style="color: #374151; font-size: 14px; line-height: 1.45; letter-spacing: -0.08px; margin: 0 0 20px 0; text-align: center;">
                                지란지교패밀리 윤리경영 상담센터에 새로운 제보가 접수되었습니다.
                            </p>

                            <!-- Inquiry Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #ffffff; border-radius: 12px; border: 1px solid #FF8A20; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 28px;">
                                        <p
                                            style="color: #111827; font-size: 14px; letter-spacing: -0.05px; margin: 0 0 10px 0; font-weight: 700;">
                                            제보 제목</p>
                                        <p
                                            style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">
                                            ${title}
                                        </p>

                                        <p
                                            style="color: #111827; font-size: 14px; letter-spacing: -0.05px; margin: 0 0 10px 0; font-weight: 700;">
                                            제보자 정보</p>
                                        <p
                                            style="color: #4B5563; font-size: 13px; line-height: 1.6; letter-spacing: -0.065px; margin: 0;">
                                            • 이름: ${name}<br>
                                            • 이메일: ${email}<br>
                                            ${phone ? `• 전화번호: ${phone}<br>` : ""}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Content Preview Box -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="border-left: 4px solid #FF8A20; background-color: #ff8c200d; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p
                                            style="color: #111827; font-size: 14px; letter-spacing: -0.05px; margin: 0 0 10px 0; font-weight: 700;">
                                            제보 내용 미리보기
                                        </p>
                                        <p
                                            style="color: #4B5563; font-size: 13px; line-height: 1.6; letter-spacing: -0.065px; margin: 0;">
                                            ${contentPreview}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${baseUrl}"
                                            style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: -0.08px;">
                                            제보 상세보기 및 답변하기
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p
                                            style="color: #6B7280; font-size: 13px; line-height: 1.6; letter-spacing: -0.065px; margin: 0;">
                                            • 제보 ID: <strong>${inquiryId}</strong><br>
                                            • 위 버튼을 클릭하시면 관리 페이지에서 제보 전체 내용을 확인하고 답변하실 수 있습니다
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid rgba(17, 24, 39, 0.1);">
                            <p style="color: #9CA3AF; font-size: 14px; letter-spacing: -0.065px; margin: 0 0 10px 0;">
                                지란지교패밀리 윤리경영 상담센터
                            </p>
                            <p style="color: #9CA3AF; font-size: 12px; letter-spacing: -0.06px; margin: 0;">
                                본 메일은 발신 전용입니다.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`;

    // Send email
    await transporter.sendMail({
      from: `"지란지교패밀리 윤리경영 상담센터" <${smtpFrom}>`,
      to: adminEmail,
      subject: `[새 제보] ${title}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
