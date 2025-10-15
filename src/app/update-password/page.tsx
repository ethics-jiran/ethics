"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 링크입니다");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "비밀번호 변경에 실패했습니다");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "비밀번호 변경에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-32 w-32 items-center justify-center rounded-md">
                <Image src="/logo.svg" alt="Logo" width={128} height={128} />
              </div>
              <h1 className="text-xl font-bold">비밀번호가 변경되었습니다</h1>
              <div className="text-center text-sm text-muted-foreground">
                새 비밀번호로 로그인할 수 있습니다.
                <br />
                잠시 후 로그인 페이지로 이동합니다.
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                로그인 페이지로 이동
              </Button>
            </Link>
          </div>
        </div>
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
                  disabled={!token}
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
                  disabled={!token}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full">
                {loading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </div>
            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-primary underline underline-offset-4">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-32 w-32 items-center justify-center rounded-md">
                <Image src="/logo.svg" alt="Logo" width={128} height={128} />
              </div>
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            </div>
          </div>
        </div>
      }>
      <UpdatePasswordForm />
    </Suspense>
  );
}
