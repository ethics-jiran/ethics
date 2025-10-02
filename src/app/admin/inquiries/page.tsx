'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminInquiriesPage() {
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const router = useRouter();

  const queryParams = new URLSearchParams();
  if (status !== 'all') queryParams.set('status', status);
  if (search) queryParams.set('search', search);
  queryParams.set('limit', limit.toString());
  queryParams.set('offset', offset.toString());

  const { data, isLoading, error } = useSWR(
    `/api/admin/inquiries?${queryParams}`,
    fetcher
  );

  const handleRowClick = (id: string) => {
    router.push(`/admin/inquiries/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>제보 관리</CardTitle>
        <CardDescription>제보를 관리하고 답변하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="processing">처리중</option>
            <option value="completed">완료</option>
          </select>

          <Input
            placeholder="제목, 이름, 이메일로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error.message || '제보를 불러오는데 실패했습니다'}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">불러오는 중...</div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">제보가 없습니다</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">제목</th>
                  <th className="text-left p-3 text-sm font-medium">이름</th>
                  <th className="text-left p-3 text-sm font-medium">이메일</th>
                  <th className="text-left p-3 text-sm font-medium">상태</th>
                  <th className="text-left p-3 text-sm font-medium">작성일</th>
                  <th className="text-left p-3 text-sm font-medium">답변</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((inquiry: any) => {
                  const statusText = {
                    pending: '대기중',
                    processing: '처리중',
                    completed: '완료'
                  };
                  return (
                    <tr
                      key={inquiry.id}
                      onClick={() => handleRowClick(inquiry.id)}
                      className="border-t cursor-pointer hover:bg-muted/30 transition"
                    >
                      <td className="p-3 text-sm">{inquiry.title}</td>
                      <td className="p-3 text-sm">{inquiry.name}</td>
                      <td className="p-3 text-sm">{inquiry.email}</td>
                      <td className="p-3">
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
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="p-3 text-sm">{inquiry.hasReply ? '✓' : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {offset + 1}-{Math.min(offset + limit, data?.total || 0)} / {data?.total || 0}개
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              이전
            </Button>
            <Button
              variant="outline"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= (data?.total || 0)}
            >
              다음
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
