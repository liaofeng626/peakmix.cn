"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";

type FeedbackItem = {
  id: number;
  userId: number;
  email: string;
  type: string;
  content: string;
  contact: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  usage: "使用问题",
  process_failed: "处理失败",
  download: "下载问题",
  feature_suggestion: "功能建议",
  other: "其他",
};

function typeLabel(type: string) {
  return TYPE_LABELS[type] || type;
}

/**
 * 内测反馈列表（仅管理员接口可见数据）
 */
export default function FeedbacksAdminPage() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setForbidden(false);
    try {
      const res = await apiFetch("/feedback");
      const j = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setForbidden(true);
        setItems([]);
        setErr(j?.message || "无权查看反馈列表");
        return;
      }
      if (!res.ok) {
        setItems(null);
        setErr(j?.message || "加载失败，请稍后重试");
        return;
      }
      setItems(Array.isArray(j.feedbacks) ? j.feedbacks : []);
    } catch {
      setItems(null);
      setErr("网络错误：无法连接服务器");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">内测反馈</h1>
          <p className="mt-2 text-sm text-stone-600">
            这里显示最近 100 条用户反馈，仅管理员可见。
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={load} disabled={loading}>
          {loading ? "刷新中…" : "刷新"}
        </Button>
      </div>

      {loading && (
        <InlineNotice tone="info">
          <p className="font-medium">正在加载反馈列表…</p>
          <p className="mt-1 text-sm text-sky-900/80">若数据较多，可能需要一两秒。</p>
        </InlineNotice>
      )}

      {forbidden && !loading && (
        <InlineNotice tone="danger">
          <p className="font-medium">无权访问</p>
          <p className="mt-1 text-sm text-red-900/80">{err || "无权查看反馈列表"}</p>
        </InlineNotice>
      )}

      {!forbidden && err && !loading && (
        <InlineNotice tone="danger">
          <div className="space-y-2">
            <p className="font-medium">加载失败</p>
            <p className="text-sm text-red-900/80">{err}</p>
            <Button type="button" variant="secondary" size="sm" onClick={load}>
              重试
            </Button>
          </div>
        </InlineNotice>
      )}

      {!loading && !forbidden && !err && items && items.length === 0 && (
        <InlineNotice tone="info">
          <p className="text-sm text-sky-900/80">暂无用户反馈记录。</p>
        </InlineNotice>
      )}

      {!loading && !forbidden && !err && items && items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">最近 {items.length} 条</h2>
            <p className="mt-1 text-xs text-stone-500">按提交时间倒序，最多 100 条。</p>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">时间</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">类型</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">用户邮箱</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">联系方式</th>
                    <th className="px-3 py-3 font-medium">内容</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {items.map((f) => (
                    <tr key={f.id} className="align-top">
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-600">
                        {new Date(f.createdAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-stone-800">
                        {typeLabel(f.type)}
                      </td>
                      <td className="max-w-[180px] break-all px-3 py-3 text-stone-700">
                        {f.email}
                      </td>
                      <td className="max-w-[140px] break-all px-3 py-3 text-stone-600">
                        {f.contact || "—"}
                      </td>
                      <td className="max-w-md px-3 py-3 text-stone-800">
                        <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                          {f.content}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
