'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Admin {
  id: string;
  email: string;
  receive_notifications: boolean;
  created_at: string;
  settings_id: string | null;
}

export default function AdminsPage() {
  const [search, setSearch] = useState('');

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);

  const { data, isLoading, error: fetchError, mutate } = useSWR(
    `/api/admin/admins?${queryParams}`,
    fetcher
  );

  const handleToggleNotifications = async (admin: Admin) => {
    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receive_notifications: !admin.receive_notifications,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>관리자 관리</CardTitle>
        <CardDescription>
          인증 시스템에 등록된 관리자 계정의 이메일 알림 설정을 관리하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="이메일로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {fetchError && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {fetchError.message || '관리자 목록을 불러오는데 실패했습니다'}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">불러오는 중...</div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">관리자가 없습니다</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">이메일</th>
                  <th className="text-left p-3 text-sm font-medium">이메일 알림 수신</th>
                  <th className="text-left p-3 text-sm font-medium">가입일</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((admin: Admin) => (
                  <tr key={admin.id} className="border-t hover:bg-muted/30 transition">
                    <td className="p-3 text-sm">{admin.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={admin.receive_notifications}
                          onCheckedChange={() => handleToggleNotifications(admin)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {admin.receive_notifications ? '수신' : '미수신'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(admin.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          총 {data?.total || 0}명
        </div>

        <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-1">안내</p>
          <p>• 관리자는 인증 시스템(Supabase Auth)에서 관리됩니다</p>
          <p>• 이메일 알림 수신 설정만 여기서 변경할 수 있습니다</p>
          <p>• 새로운 제보가 등록되면 알림 수신이 활성화된 관리자에게 이메일이 발송됩니다</p>
        </div>
      </CardContent>
    </Card>
  );
}
