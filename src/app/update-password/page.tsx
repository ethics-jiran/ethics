'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import Image from 'next/image';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsMFA, setNeedsMFA] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkMFA();
  }, []);

  const checkMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        setNeedsMFA(true);
        const factor = factors.totp[0];
        setFactorId(factor.id);

        // Create challenge
        const { data: challenge } = await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

        if (challenge) {
          setChallengeId(challenge.id);
        }
      }
    } catch (err) {
      console.error('MFA check failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다');
      setLoading(false);
      return;
    }

    try {
      // If MFA is enabled, verify TOTP first
      if (needsMFA) {
        if (!totpCode || totpCode.length !== 6) {
          setError('인증 코드를 입력해주세요');
          setLoading(false);
          return;
        }

        const { error: mfaError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId,
          code: totpCode,
        });

        if (mfaError) {
          setError('인증 코드가 올바르지 않습니다');
          setLoading(false);
          return;
        }
      }

      // Now update password with AAL2 session
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      alert('비밀번호가 성공적으로 변경되었습니다');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-md">
              <Image src="/logo.svg" alt="Logo" width={64} height={64} />
            </div>
            <h1 className="text-xl font-bold">새 비밀번호 설정</h1>
            <div className="text-center text-sm text-muted-foreground">
              새로운 비밀번호를 입력하세요
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">새 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 6자 이상"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>
              {needsMFA && (
                <div className="flex flex-col gap-2">
                  <Label className="text-center block">2단계 인증 코드</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={totpCode}
                      onChange={(value) => setTotpCode(value)}
                    >
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
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
