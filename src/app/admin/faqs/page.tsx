"use client";

import { Badge } from "@/components/ui/badge";
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

export default function AdminFaqsPage() {
  const { data, isLoading, error, mutate } = useSWR("/api/admin/faqs", fetcher);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    display_order: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contentArray = formData.content
      ? formData.content.split("\n").filter((line) => line.trim())
      : null;

    const body = {
      title: formData.title,
      content: contentArray,
      display_order: formData.display_order,
      is_active: formData.is_active,
    };

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/admin/faqs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("수정에 실패했습니다");
      } else {
        // Create
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("생성에 실패했습니다");
      }

      mutate();
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert("저장에 실패했습니다.");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content ? item.content.join("\n") : "",
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제에 실패했습니다");
      mutate();
    } catch (error) {
      console.error("Error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      display_order: 0,
      is_active: true,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>FAQ 관리</CardTitle>
          <CardDescription>상담 및 제보 대상 FAQ를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsAdding(!isAdding)} className="mb-4">
            {isAdding ? "취소" : "+ 새 항목 추가"}
          </Button>

          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 mb-6 p-4 border rounded-lg">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">내용 (한 줄씩 입력)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={5}
                  placeholder="- 첫 번째 항목&#10;- 두 번째 항목&#10;- 세 번째 항목"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">표시 순서</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <Label htmlFor="is_active">활성화</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingId ? "수정" : "추가"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  취소
                </Button>
              </div>
            </form>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm mb-4">
              {error.message || "데이터를 불러오는데 실패했습니다"}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              불러오는 중...
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              항목이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {data?.data?.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge
                          variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "활성" : "비활성"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          순서: {item.display_order}
                        </span>
                      </div>
                      {item.content && item.content.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {item.content.map((line: string, i: number) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}>
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
