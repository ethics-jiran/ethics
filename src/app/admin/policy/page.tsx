"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PolicyPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: policyData,
    error: loadError,
    mutate,
  } = useSWR("/api/admin/policy", fetcher, {
    onSuccess: (data) => {
      if (data.data) {
        setTitle(data.data.title);
        setContent(data.data.content);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!policyData?.data?.id) {
        throw new Error("Policy ID not found");
      }

      const res = await fetch(`/api/admin/policy/${policyData.data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error("정책 업데이트에 실패했습니다");
      }

      setSuccess("정책이 성공적으로 업데이트되었습니다!");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">정책을 불러오는데 실패했습니다</div>
        </CardContent>
      </Card>
    );
  }

  if (!policyData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-muted-foreground">불러오는 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>상담자 보호정책 관리</CardTitle>
          <CardDescription>
            외부 사용자에게 표시될 상담자 보호정책을 작성 및 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">정책 제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 상담자 보호정책"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">정책 내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="정책 내용을 입력하세요..."
                rows={20}
                required
                maxLength={50000}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {content.length.toLocaleString()} / 50,000 characters
              </p>
            </div>

            {policyData.data && (
              <div className="text-xs text-muted-foreground">
                마지막 수정:{" "}
                {new Date(policyData.data.updated_at).toLocaleString("ko-KR")}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "저장 중..." : "정책 저장"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
