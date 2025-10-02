'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        const factor = factors.totp[0];
        setFactorId(factor.id);

        // Create MFA challenge
        const { data: challenge } = await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

        if (challenge) {
          setChallengeId(challenge.id);
          setStep('mfa');
        }
      } else {
        // No MFA configured, redirect to setup
        router.push('/admin/setup-mfa');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: totpCode,
      });

      if (error) throw error;

      // Redirect to admin panel
      router.push('/admin/inquiries');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    }
  };

  if (step === 'mfa') {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-md">
            <Image src="/logo.svg" alt="Logo" width={64} height={64} />
          </div>
          <h1 className="text-xl font-bold">2단계 인증</h1>
          <div className="text-center text-sm text-muted-foreground">
            인증 앱에서 생성된 코드를 입력하세요
          </div>
        </div>
        <form onSubmit={handleMfaVerify} className="flex flex-col gap-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
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
          </div>
          <Button type="submit" className="w-full">
            인증
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-md">
          <Image src="/logo.svg" alt="Logo" width={64} height={64} />
        </div>
        <h1 className="text-xl font-bold">관리자 로그인</h1>
        <div className="text-center text-sm text-muted-foreground">
          지란지교패밀리 윤리경영 제보관리센터
        </div>
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            로그인
          </Button>
        </div>
        <div className="text-center text-sm">
          <a href="/reset-password" className="text-muted-foreground hover:text-primary underline underline-offset-4">
            비밀번호를 잊으셨나요?
          </a>
        </div>
      </form>
    </div>
  );
}
