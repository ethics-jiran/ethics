"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import Image from "next/image";

export default function SetupMFAPage() {
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Check if MFA is already enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        // MFA already set up, redirect to admin
        router.push("/admin/inquiries");
        return;
      }

      // Enroll MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Cherish Admin",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err: any) {
      setError(err.message || "MFA 설정 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });

      if (error) throw error;

      // MFA verified successfully
      router.push("/admin/inquiries");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "인증 코드가 올바르지 않습니다");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-32 w-32 items-center justify-center rounded-md">
              <Image src="/logo.svg" alt="Logo" width={128} height={128} />
            </div>
            <h1 className="text-xl font-bold">2단계 인증 설정</h1>
            <div className="text-center text-sm text-muted-foreground">
              Google Authenticator 또는 다른 TOTP 앱으로 QR 코드를 스캔하세요
            </div>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {qrCode && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-muted-foreground">
                  수동 입력 코드 (QR 코드 스캔이 안 되는 경우)
                </Label>
                <div className="bg-background px-3 py-2 rounded-md font-mono text-sm text-center border">
                  {secret}
                </div>
              </div>
              <form onSubmit={handleVerify} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-center block">인증 코드 입력</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={verifyCode}
                      onChange={(value) => setVerifyCode(value)}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    인증 앱에서 생성된 6자리 코드를 입력하세요
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  인증 완료
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
