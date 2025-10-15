import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, inquiryId, replyTitle, replyContent } = await req.json();

    // Validate required fields
    if (!email || !inquiryId || !replyTitle || !replyContent) {
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
                                지란지교패밀리 윤리경영 상담센터 답변이 등록되었습니다.
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p
                                style="color: #374151; font-size: 14px; line-height: 1.45; letter-spacing: -0.08px; margin: 0 0 20px 0; text-align: center;">
                                지란지교패밀리 윤리경영 상담센터입니다.<br>
                                귀하께서 제보하신 내용에 대한 답변이 등록되었습니다.
                            </p>

                            <!-- Reply Box -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #ffffff; border-radius: 12px; border: 1px solid #FF8A20; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 28px;">
                                        <p
                                            style="color: #FF8A20; font-size: 18px; font-weight: 700; letter-spacing: -0.09px; margin: 0 0 15px 0;">
                                            ${replyTitle}
                                        </p>
                                        <div
                                            style="color: #374151; font-size: 14px; line-height: 1.8; letter-spacing: -0.075px;">
                                            ${replyContent}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="color: #6B7280; font-size: 14px; line-height: 1.45; letter-spacing: -0.05px; margin: 20px 0; text-align: center;">
                                위 답변 내용에 대한 전체 내역을 확인하실 수 있습니다.
                            </p>

                            <!-- Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="border-left: 4px solid #FF8A20; background-color: #ff8c200d; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p
                                            style="color: #111827; font-size: 14px; letter-spacing: -0.05px; margin: 0 0 10px 0; font-weight: 700;">
                                            안내사항
                                        </p>
                                        <p
                                            style="color: #4B5563; font-size: 13px; line-height: 1.6; letter-spacing: -0.065px; margin: 0;">
                                            • 제보 ID: <strong>${inquiryId}</strong><br>
                                            • 상태: <strong>답변 완료</strong><br>
                                            • 이메일과 인증 코드로 전체 내용을 확인하실 수 있습니다<br>
                                            • 추가 문의가 필요한 경우 새로운 제보를 등록해 주세요
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
      to: email,
      subject: `[답변 완료] ${replyTitle}`,
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
