"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";

const TYPES: { value: string; label: string }[] = [
  { value: "usage", label: "使用问题" },
  { value: "process_failed", label: "处理失败" },
  { value: "download", label: "下载问题" },
  { value: "feature_suggestion", label: "功能建议" },
  { value: "other", label: "其他" },
];

/**
 * 内测：站内反馈（不跳转外部平台）
 */
export default function FeedbackPage() {
  const [type, setType] = useState("usage");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify({ type, content: content.trim(), contact: contact.trim() || undefined }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j?.message || "提交失败，请稍后重试");
        return;
      }
      setDone(true);
      setContent("");
      setContact("");
    } catch {
      setErr("网络异常，请检查连接后重试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">反馈问题</h1>
        <p className="mt-2 text-sm text-stone-600">
          如果你在上传、处理、下载过程中遇到问题，可以在这里反馈。建议说明你在哪一步遇到问题，例如上传、处理、下载，最好附上任务名称。
        </p>
        <p className="mt-1 text-sm text-stone-500">
          我们会根据内测反馈继续优化体验。可选填微信或邮箱，便于必要时联系你核实细节。
        </p>
      </div>

      {done && (
        <InlineNotice tone="info">
          <p className="font-medium">已收到反馈，感谢你的内测建议。</p>
        </InlineNotice>
      )}

      {err && (
        <InlineNotice tone="danger">
          <p className="text-sm text-red-900/80">{err}</p>
        </InlineNotice>
      )}

      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-sm font-medium text-stone-900">提交表单</h2>
          <p className="mt-1 text-xs text-stone-500">带星号为必填</p>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium text-stone-800">反馈类型</label>
              <select
                className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-stone-900/10 focus:ring-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={busy}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-800">
                问题描述 <span className="text-red-600">*</span>
              </label>
              <textarea
                className="mt-2 min-h-[140px] w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-stone-900/10 focus:ring-2"
                placeholder="例如：任务「某某活动」在处理步骤报错…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-800">联系方式（选填）</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-stone-900/10 focus:ring-2"
                placeholder="微信 / 邮箱"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={busy || !content.trim()}>
                {busy ? "提交中…" : "提交反馈"}
              </Button>
              {done && (
                <Button type="button" variant="secondary" disabled={busy} onClick={() => setDone(false)}>
                  继续反馈
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
