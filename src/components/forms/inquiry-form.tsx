'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInquirySchema, type CreateInquiryInput } from '@/lib/validations/inquiry';
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
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientCrypto } from '@/lib/client-crypto';

export function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crypto] = useState(() => new ClientCrypto());

  useEffect(() => {
    crypto.init().catch(console.error);
  }, [crypto]);

  const form = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      title: '',
      content: '',
      email: '',
      name: '',
      phone: '',
    },
  });

  const onSubmit = async (data: CreateInquiryInput) => {
    try {
      setError(null);

      // Encrypt all fields
      const encrypted_title = await crypto.encrypt(data.title);
      const encrypted_content = await crypto.encrypt(data.content || '');
      const encrypted_email = await crypto.encrypt(data.email);
      const encrypted_name = await crypto.encrypt(data.name || '');
      const encrypted_phone = data.phone ? await crypto.encrypt(data.phone) : undefined;

      const payload = {
        encrypted_title,
        encrypted_content,
        encrypted_email,
        encrypted_name,
        encrypted_phone,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">제보가 접수되었습니다!</CardTitle>
          <CardDescription>
            제보해 주셔서 감사합니다. 인증 코드를 이메일로 보내드렸습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            제보 상태를 확인하려면 이메일로 받은 인증 코드를 입력해주세요.
          </p>
          <Button onClick={() => (window.location.href = '/inquiry/check')}>
            제보 조회하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>제보하기</CardTitle>
        <CardDescription>
          아래 양식을 작성해주시면 빠른 시일 내에 답변 드리겠습니다.
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="제보 제목을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="제보 내용을 상세히 입력해주세요..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="성함을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 (선택)</FormLabel>
                  <FormControl>
                    <Input placeholder="010-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? '제출 중...' : '제보 제출'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
