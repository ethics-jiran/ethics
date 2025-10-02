'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyInquirySchema, type VerifyInquiryInput } from '@/lib/validations/inquiry';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { ClientCrypto } from '@/lib/client-crypto';

export function InquiryCheckForm() {
  const [inquiry, setInquiry] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crypto] = useState(() => new ClientCrypto());

  useEffect(() => {
    crypto.init().catch(console.error);
  }, [crypto]);

  const form = useForm<VerifyInquiryInput>({
    resolver: zodResolver(verifyInquirySchema),
    defaultValues: {
      email: '',
      authCode: '',
    },
  });

  const onSubmit = async (data: VerifyInquiryInput) => {
    try {
      setError(null);

      // Encrypt email
      const encrypted_email = await crypto.encrypt(data.email || '');

      const payload = {
        encrypted_email,
        authCode: data.authCode,
      };

      const res = await fetch('/api/inquiries/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invalid email or verification code');
      }

      const inquiryData = await res.json();
      setInquiry(inquiryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setInquiry(null);
    }
  };

  const statusText = {
    pending: '대기중',
    processing: '처리중',
    completed: '완료'
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>제보 조회</CardTitle>
          <CardDescription>
            이메일과 인증 코드를 입력하여 제보 내역을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>인증 코드</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="6자리 코드"
                        maxLength={6}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? '조회 중...' : '제보 조회'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {inquiry && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{inquiry.title}</CardTitle>
                <CardDescription>
                  제출일: {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
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

            {inquiry.reply_title && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 text-primary">{inquiry.reply_title}</h3>
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
      )}
    </div>
  );
}
