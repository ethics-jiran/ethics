'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { use, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: inquiry, error: loadError, mutate } = useSWR(
    `/api/admin/inquiries/${id}`,
    fetcher
  );

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyTitle,
          replyContent,
          status: status || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit reply');
      }

      setSuccess('Reply sent successfully!');
      setReplyTitle('');
      setReplyContent('');
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const statusText = {
    pending: '대기중',
    processing: '처리중',
    completed: '완료'
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">제보를 불러오는데 실패했습니다</div>
        </CardContent>
      </Card>
    );
  }

  if (!inquiry) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-muted-foreground">불러오는 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{inquiry.title}</CardTitle>
              <CardDescription>
                {inquiry.name} ({inquiry.email}) •{' '}
                {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
              </CardDescription>
            </div>
            <Badge
              variant={
                inquiry.status === 'completed'
                  ? 'default'
                  : inquiry.status === 'processing'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {statusText[inquiry.status as keyof typeof statusText]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">제보 내용</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {inquiry.content}
            </p>
          </div>

          {inquiry.phone && (
            <div>
              <h3 className="font-semibold mb-1">전화번호</h3>
              <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
            </div>
          )}

          {inquiry.reply_title && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 text-primary">
                현재 답변: {inquiry.reply_title}
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {inquiry.reply_content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                답변일: {new Date(inquiry.replied_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>답변 보내기</CardTitle>
          <CardDescription>제보에 답변하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReply} className="space-y-4">
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
              <Label htmlFor="replyTitle">답변 제목</Label>
              <Input
                id="replyTitle"
                value={replyTitle}
                onChange={(e) => setReplyTitle(e.target.value)}
                placeholder="답변 제목을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyContent">답변 내용</Label>
              <Textarea
                id="replyContent"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답변 내용을 입력하세요..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태 변경 (선택)</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">현재 상태 유지</option>
                <option value="pending">대기중</option>
                <option value="processing">처리중</option>
                <option value="completed">완료</option>
              </select>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? '전송 중...' : '답변 전송'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
