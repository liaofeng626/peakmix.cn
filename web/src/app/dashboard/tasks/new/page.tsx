"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";

/**
 * 新建任务：填写「本次音频名称」后进入详情页上传文件
 */
export default function NewTaskPage() {
  const router = useRouter();
  const [audioTitle, setAudioTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({ audioTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "创建失败");
        return;
      }
      router.push(`/dashboard/tasks/${data.id}`);
    } catch {
      setErr("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">新建任务</h1>
        <p className="mt-2 text-sm text-stone-600">
          你只需要先给“最终成品”起个名字。创建后进入任务详情页上传多个 MP3，并一键随机排序、拼接与导出。
        </p>
      </div>

      <InlineNotice tone="info">
        <div className="space-y-1">
          <p className="font-medium">合规边界</p>
          <p className="text-sm text-sky-900/80">
            PeakMix 不提供公共曲库、在线播放或用户间分享功能。请仅上传你拥有使用权的自有音频。
          </p>
        </div>
      </InlineNotice>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">任务信息</h2>
            <p className="mt-1 text-xs text-stone-500">
              这个名称会写入 Excel 顺序表，也会作为下载文件的默认命名参考。
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  本次音频名称
                </label>
                <input
                  required
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="例如：五一汇演排练合集"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-stone-900/30 focus:ring-2"
                />
              </div>

              {err && (
                <InlineNotice tone="danger" className="text-sm">
                  {err}
                </InlineNotice>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "创建中…" : "创建并进入上传"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => router.push("/dashboard/tasks")}
                >
                  返回任务列表
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">处理步骤</h2>
            <p className="mt-1 text-xs text-stone-500">清晰告诉用户接下来会发生什么。</p>
          </CardHeader>
          <CardBody>
            <ol className="space-y-3 text-sm text-stone-700">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                  1
                </span>
                <div>
                  <p className="font-medium text-stone-900">上传多个 MP3</p>
                  <p className="mt-0.5 text-xs text-stone-500">仅用于本次任务处理与下载。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                  2
                </span>
                <div>
                  <p className="font-medium text-stone-900">随机排序</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    系统会生成一个随机顺序并写入 Excel。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                  3
                </span>
                <div>
                  <p className="font-medium text-stone-900">ffmpeg 拼接导出</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    输出成品 MP3 + Excel 顺序表（不提供在线播放）。
                  </p>
                </div>
              </li>
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
