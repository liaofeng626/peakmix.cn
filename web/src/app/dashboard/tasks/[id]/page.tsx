"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, downloadAuthed } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";

type TaskDetail = {
  id: number;
  audio_title: string;
  status: string;
  output_mp3_path?: string | null;
  output_xlsx_path?: string | null;
  error_message: string | null;
  created_at: string;
};

type FileRow = {
  id: number;
  original_filename: string;
  sort_order: number;
};

/**
 * 任务详情：上传 MP3、触发处理、下载成品（无在线播放）
 */
export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    const res = await apiFetch(`/api/v1/tasks/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.message || "加载失败");
      return;
    }
    setTask(data.task);
    setFiles(data.files);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // 处理中时自动刷新状态，减少“卡住”的不确定感
  useEffect(() => {
    if (!autoRefresh) return;
    if (!task || task.status !== "processing") return;
    const t = window.setInterval(() => {
      load();
    }, 2000);
    return () => window.clearInterval(t);
  }, [autoRefresh, load, task]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      Array.from(list).forEach((f) => fd.append("files", f));
      const res = await apiFetch(`/api/v1/tasks/${id}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "上传失败");
        return;
      }
      setMsg(`已上传 ${data.count} 个文件`);
      await load();
    } catch {
      setMsg("上传出错");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onProcess() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiFetch(`/api/v1/tasks/${id}/process`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "处理失败");
        await load();
        return;
      }
      setMsg(data.message || "处理完成");
      await load();
    } catch {
      setMsg("处理出错");
    } finally {
      setBusy(false);
    }
  }

  async function dlMp3() {
    try {
      await downloadAuthed(`/api/v1/tasks/${id}/download/mp3`, `peakmix-task-${id}.mp3`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "下载失败");
    }
  }

  async function dlXlsx() {
    try {
      await downloadAuthed(`/api/v1/tasks/${id}/download/xlsx`, `peakmix-order-${id}.xlsx`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "下载失败");
    }
  }

  if (!task && !msg) {
    return <p className="text-sm text-stone-500">加载中…</p>;
  }
  if (!task) {
    return <p className="text-sm text-red-600">{msg}</p>;
  }

  const canUpload = !(busy || task.status === "processing" || task.status === "done");
  const canProcess =
    !busy && task.status !== "processing" && task.status !== "done" && files.length > 0;
  const canDownload = task.status === "done";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.push("/dashboard/tasks")}
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            ← 返回任务列表
          </button>
          <h1 className="mt-3 truncate text-2xl font-semibold tracking-tight">
            {task.audio_title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <span className="text-xs text-stone-500">
              创建时间：{new Date(task.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => load()}
          >
            刷新状态
          </Button>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-stone-900"
            />
            处理中自动刷新
          </label>
        </div>
      </div>

      <InlineNotice tone="info">
        <div className="space-y-1">
          <p className="font-medium">提示</p>
          <p className="text-sm text-sky-900/80">
            本站不提供在线播放/分享。处理完成后，你可以下载成品 MP3 与 Excel 顺序表。
          </p>
        </div>
      </InlineNotice>

      {task.error_message && (
        <InlineNotice tone="danger">
          <p className="font-medium">处理失败原因</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-red-900/80">
            {task.error_message}
          </p>
        </InlineNotice>
      )}
      {msg && <InlineNotice tone="warn">{msg}</InlineNotice>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">步骤 1：上传 MP3</h2>
            <p className="mt-1 text-xs text-stone-500">
              支持多文件上传。建议文件名尽量清晰，便于 Excel 顺序表阅读。
            </p>
          </CardHeader>
          <CardBody>
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5">
              <p className="text-sm font-medium text-stone-900">选择多个 .mp3 文件</p>
              <p className="mt-1 text-xs text-stone-500">
                单次最多 50 个文件；单文件最大 80MB（可在服务端配置调整）。
              </p>
              <input
                type="file"
                accept=".mp3,audio/mpeg"
                multiple
                disabled={!canUpload}
                onChange={onUpload}
                className="mt-4 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-stone-800 disabled:opacity-50"
              />
              {!canUpload && task.status === "processing" && (
                <p className="mt-3 text-xs text-stone-500">任务处理中，暂不可上传。</p>
              )}
              {!canUpload && task.status === "done" && (
                <p className="mt-3 text-xs text-stone-500">
                  任务已完成。如需新一轮随机排序，请新建任务。
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">
              步骤 2：随机排序并拼接
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              会生成两份产物：成品 MP3 与 Excel 顺序表。
            </p>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" disabled={!canProcess} onClick={onProcess}>
                {task.status === "processing" ? "处理中…" : "开始处理（ffmpeg）"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!canDownload}
                onClick={dlMp3}
              >
                下载成品 MP3
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!canDownload}
                onClick={dlXlsx}
              >
                下载 Excel 顺序表
              </Button>
            </div>

            {task.status === "processing" && (
              <p className="mt-3 text-xs text-stone-500">
                正在拼接导出中（可能需要几十秒到数分钟，取决于文件数量与时长）。
              </p>
            )}
            {task.status === "done" && (
              <p className="mt-3 text-xs text-stone-500">
                已生成下载产物。为节省磁盘空间，服务器可能会定期清理旧文件。
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-stone-900">文件清单</h2>
              <p className="mt-1 text-xs text-stone-500">
                处理后会显示随机顺序（#1、#2…）。未处理前顺序为空。
              </p>
            </div>
            <div className="text-xs text-stone-500">共 {files.length} 个</div>
          </div>
        </CardHeader>
        <CardBody>
          {files.length === 0 ? (
            <p className="text-sm text-stone-500">暂无文件。请先上传 MP3。</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">顺序</th>
                    <th className="px-4 py-3 font-medium">文件名</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {files.map((f) => (
                    <tr key={f.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {f.sort_order > 0 ? `#${f.sort_order}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-700">{f.original_filename}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
