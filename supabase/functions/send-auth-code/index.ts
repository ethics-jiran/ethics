import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { email, authCode, inquiryId } = await req.json();

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
        subject: '윤리경영 제보가 접수되었습니다',
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
                          윤리경영 제보 접수 완료
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
                          귀하의 소중한 제보가 정상적으로 접수되었습니다.
                        </p>

                        <!-- Auth Code Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; border: 2px solid #667eea; margin: 30px 0;">
                          <tr>
                            <td style="padding: 30px; text-align: center;">
                              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">인증 코드</p>
                              <p style="color: #667eea; font-size: 32px; font-weight: 700; letter-spacing: 4px; margin: 0; font-family: monospace;">
                                ${authCode}
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                          위 인증 코드를 사용하여 제보 내역을 조회하고 답변을 확인하실 수 있습니다.
                        </p>

                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="https://cherish-jiran.vercel.app/sample/sample-check-form" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                                제보 내역 조회하기
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Info Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="color: #e65100; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                                📌 안내사항
                              </p>
                              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0;">
                                • 제보 ID: <strong>${inquiryId}</strong><br>
                                • 인증 코드는 제보 조회 시 사용됩니다<br>
                                • 답변이 등록되면 이메일로 알려드립니다<br>
                                • 본 이메일은 재발송되지 않으니 안전하게 보관해 주세요
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
