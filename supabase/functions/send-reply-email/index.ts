import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { email, inquiryId, replyTitle, replyContent } = await req.json();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: '지란지교패밀리 윤리경영 <onboarding@resend.dev>',
        to: [email],
        subject: `[답변 완료] ${replyTitle}`,
        html: `
          <!DOCTYPE html>
          <html lang="ko">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                          ✅ 제보 답변이 등록되었습니다
                        </h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          지란지교패밀리 윤리경영 제보관리센터입니다.
                        </p>
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          귀하께서 제보하신 내용에 대한 답변이 등록되었습니다.
                        </p>

                        <!-- Reply Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; margin: 30px 0;">
                          <tr>
                            <td style="padding: 30px;">
                              <p style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                ${replyTitle}
                              </p>
                              <div style="color: #333333; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
                                ${replyContent}
                              </div>
                            </td>
                          </tr>
                        </table>

                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="https://cherish-jiran.vercel.app/sample/sample-check-form" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                                전체 내용 확인하기
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Info Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="color: #1565c0; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                                ℹ️ 제보 정보
                              </p>
                              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0;">
                                • 제보 ID: <strong>${inquiryId}</strong><br>
                                • 상태: <strong>답변 완료</strong><br>
                                • 이메일과 인증 코드로 전체 내용을 확인하실 수 있습니다
                              </p>
                            </td>
                          </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="color: #e65100; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                                💡 추가 문의
                              </p>
                              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0;">
                                답변에 대한 추가 문의가 필요하신 경우,<br>
                                새로운 제보를 통해 문의해 주시기 바랍니다.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999999; font-size: 13px; margin: 0 0 10px 0;">
                          지란지교패밀리 윤리경영 제보관리센터
                        </p>
                        <p style="color: #999999; font-size: 12px; margin: 0;">
                          본 메일은 발신 전용입니다. 문의사항이 있으시면 제보 시스템을 이용해 주세요.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Email delivery failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
