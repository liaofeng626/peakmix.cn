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

/** Task detail: upload, process, download */
export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadInFlight, setUploadInFlight] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    const res = await apiFetch(`/tasks/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.message || "\u52a0\u8f7d\u5931\u8d25");
      return;
    }
    setTask(data.task);
    setFiles(data.files);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
    setUploadInFlight(true);
    setMsg(null);
    try {
      const fd = new FormData();
      Array.from(list).forEach((f) => fd.append("files", f));
      const res = await apiFetch(`/tasks/${id}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "\u4e0a\u4f20\u5931\u8d25");
        return;
      }
      setMsg(`\u5df2\u4e0a\u4f20 ${data.count} \u4e2a\u6587\u4ef6`);
      await load();
    } catch {
      setMsg("\u4e0a\u4f20\u51fa\u9519");
    } finally {
      setUploadInFlight(false);
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onProcess() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiFetch(`/tasks/${id}/process`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data?.code === "DAILY_QUOTA_EXCEEDED") {
        const base =
          typeof data.message === "string" && data.message
            ? data.message
            : "\u4eca\u65e5\u514d\u8d39\u5904\u7406\u6b21\u6570\u5df2\u7528\u5b8c\u3002\u5185\u6d4b\u671f\u95f4\u5982\u9700\u66f4\u591a\u989d\u5ea6\uff0c\u8bf7\u8054\u7cfb\u7ba1\u7406\u5458\u5f00\u901a\u3002";
        const q = data.quota as { used?: number; limit?: number; plan?: string } | undefined;
        let extra = "";
        if (q && typeof q.used === "number" && typeof q.limit === "number") {
          extra = ` \u4eca\u65e5\u5df2\u7528 ${q.used}/${q.limit}\u3002`;
          if (q.plan === "free" && q.limit === 1) {
            extra += "\u514d\u8d39\u7248\u6bcf\u5929 1 \u6b21\u3002";
          }
        }
        setMsg(base + extra);
        await load();
        return;
      }
      if (!res.ok) {
        setMsg(data.message || "\u5904\u7406\u5931\u8d25");
        await load();
        return;
      }
      setMsg(data.message || "\u5904\u7406\u5b8c\u6210");
      await load();
    } catch {
      setMsg("\u5904\u7406\u51fa\u9519\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
    } finally {
      setBusy(false);
    }
  }

  async function dlMp3() {
    try {
      await downloadAuthed(`/tasks/${id}/download/mp3`, `peakmix-task-${id}.mp3`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "\u4e0b\u8f7d\u5931\u8d25");
    }
  }

  async function dlXlsx() {
    try {
      await downloadAuthed(`/tasks/${id}/download/xlsx`, `peakmix-order-${id}.xlsx`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "\u4e0b\u8f7d\u5931\u8d25");
    }
  }

  if (!task && !msg) {
    return <p className="text-sm text-stone-500">{"\u52a0\u8f7d\u4e2d..."}</p>;
  }
  if (!task) {
    return <p className="text-sm text-red-600">{msg}</p>;
  }

  const canUpload = !(
    busy ||
    uploadInFlight ||
    task.status === "processing" ||
    task.status === "done"
  );
  const canProcess =
    !busy &&
    !uploadInFlight &&
    task.status !== "processing" &&
    task.status !== "done" &&
    files.length > 0;
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
            {"\u2190 \u8fd4\u56de\u4efb\u52a1\u5217\u8868"}
          </button>
          <h1 className="mt-3 truncate text-2xl font-semibold tracking-tight">
            {task.audio_title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <span className="text-xs text-stone-500">
              {"\u521b\u5efa\u65f6\u95f4\uff1a"}
              {new Date(task.created_at).toLocaleString()}
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
            {"\u5237\u65b0\u72b6\u6001"}
          </Button>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-stone-900"
            />
            {"\u5904\u7406\u4e2d\u81ea\u52a8\u5237\u65b0"}
          </label>
        </div>
      </div>

      <InlineNotice tone="info">
        <div className="space-y-1">
          <p className="font-medium">{"\u63d0\u793a"}</p>
          <p className="text-sm text-sky-900/80">
            {
              "\u672c\u7ad9\u4e0d\u63d0\u4f9b\u5728\u7ebf\u64ad\u653e\u4e0e\u5206\u4eab\u3002\u5904\u7406\u5b8c\u6210\u540e\uff0c\u4f60\u53ef\u4ee5\u4e0b\u8f7d\u6210\u54c1 MP3 \u4e0e Excel \u987a\u5e8f\u8868\u3002"
            }
          </p>
        </div>
      </InlineNotice>

      {task.error_message && (
        <InlineNotice tone="danger">
          <p className="font-medium">{"\u5904\u7406\u5931\u8d25\u539f\u56e0"}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-red-900/80">
            {task.error_message}
          </p>
        </InlineNotice>
      )}
      {msg && <InlineNotice tone="warn">{msg}</InlineNotice>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">
              {"\u6b65\u9aa4 1\uff1a\u4e0a\u4f20 MP3"}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {
                "\u652f\u6301\u591a\u6587\u4ef6\u4e0a\u4f20\u3002\u5efa\u8bae\u6587\u4ef6\u540d\u5c3d\u91cf\u6e05\u6670\uff0c\u4fbf\u4e8e Excel \u987a\u5e8f\u8868\u9605\u8bfb\u3002"
              }
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <InlineNotice tone="info">
              <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-sky-900/85">
                <li>
                  {
                    "\u5185\u6d4b\u9636\u6bb5\u5efa\u8bae\u9996\u6b21\u4e0a\u4f20 3\uff5e10 \u9996 MP3 \u6d4b\u8bd5\u6d41\u7a0b\u3002"
                  }
                </li>
                <li>
                  {
                    "\u6587\u4ef6\u8d8a\u591a\u3001\u8d8a\u5927\uff0c\u4e0a\u4f20\u4e0e\u5904\u7406\u65f6\u95f4\u8d8a\u957f\u3002"
                  }
                </li>
                <li>
                  {
                    "\u5f53\u524d\u5355\u4efb\u52a1\u6700\u591a 50 \u4e2a\u6587\u4ef6\uff0c\u5355\u6587\u4ef6\u6700\u5927 80MB\u3002"
                  }
                </li>
              </ul>
            </InlineNotice>
            {uploadInFlight && (
              <InlineNotice tone="warn">
                <p className="text-sm font-medium text-amber-950/90">
                  {
                    "\u6b63\u5728\u4e0a\u4f20\uff0c\u8bf7\u4e0d\u8981\u5173\u95ed\u9875\u9762\u3002\u4e0a\u4f20\u5b8c\u6210\u540e\u518d\u5f00\u59cb\u5904\u7406\u3002"
                  }
                </p>
              </InlineNotice>
            )}
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5">
              <p className="text-sm font-medium text-stone-900">
                {"\u9009\u62e9\u591a\u4e2a .mp3 \u6587\u4ef6"}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {
                  "\u5355\u6b21\u6700\u591a 50 \u4e2a\u6587\u4ef6\uff1b\u5355\u6587\u4ef6\u6700\u5927 80MB\uff08\u53ef\u5728\u670d\u52a1\u7aef\u914d\u7f6e\u8c03\u6574\uff09\u3002"
                }
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
                <p className="mt-3 text-xs text-stone-500">
                  {"\u4efb\u52a1\u5904\u7406\u4e2d\uff0c\u6682\u4e0d\u53ef\u4e0a\u4f20\u3002"}
                </p>
              )}
              {!canUpload && task.status === "done" && (
                <p className="mt-3 text-xs text-stone-500">
                  {
                    "\u4efb\u52a1\u5df2\u5b8c\u6210\u3002\u5982\u9700\u65b0\u4e00\u8f6e\u968f\u673a\u6392\u5e8f\uff0c\u8bf7\u65b0\u5efa\u4efb\u52a1\u3002"
                  }
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">
              {"\u6b65\u9aa4 2\uff1a\u968f\u673a\u6392\u5e8f\u5e76\u62fc\u63a5"}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {"\u4f1a\u751f\u6210\u4e24\u4efd\u4ea7\u7269\uff1a\u6210\u54c1 MP3 \u4e0e Excel \u987a\u5e8f\u8868\u3002"}
            </p>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" disabled={!canProcess} onClick={onProcess}>
                {task.status === "processing"
                  ? "\u5904\u7406\u4e2d..."
                  : "\u5f00\u59cb\u5904\u7406\uff08ffmpeg\uff09"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!canDownload}
                onClick={dlMp3}
              >
                {"\u4e0b\u8f7d\u6210\u54c1 MP3"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!canDownload}
                onClick={dlXlsx}
              >
                {"\u4e0b\u8f7d Excel \u987a\u5e8f\u8868"}
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              {
                "\u5904\u7406\u4f1a\u8c03\u7528\u670d\u52a1\u5668 ffmpeg\uff0c\u6587\u4ef6\u8f83\u591a\u65f6\u53ef\u80fd\u9700\u8981\u7b49\u5f85\u3002"
              }
            </p>

            {task.status === "processing" && (
              <p className="mt-3 text-xs text-stone-500">
                {
                  "\u6b63\u5728\u62fc\u63a5\u5bfc\u51fa\u4e2d\uff08\u53ef\u80fd\u9700\u8981\u51e0\u5341\u79d2\u5230\u6570\u5206\u949f\uff0c\u53d6\u51b3\u4e8e\u6587\u4ef6\u6570\u91cf\u4e0e\u65f6\u957f\uff09\u3002"
                }
              </p>
            )}
            {task.status === "done" && (
              <p className="mt-3 text-xs text-stone-500">
                {
                  "\u5df2\u751f\u6210\u4e0b\u8f7d\u4ea7\u7269\u3002\u4e3a\u8282\u7701\u78c1\u76d8\u7a7a\u95f4\uff0c\u670d\u52a1\u5668\u53ef\u80fd\u4f1a\u5b9a\u671f\u6e05\u7406\u65e7\u6587\u4ef6\u3002"
                }
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-stone-900">{"\u6587\u4ef6\u6e05\u5355"}</h2>
              <p className="mt-1 text-xs text-stone-500">
                {
                  "\u5904\u7406\u540e\u4f1a\u663e\u793a\u968f\u673a\u987a\u5e8f\uff081\u30012\u2026\uff09\u3002\u672a\u5904\u7406\u524d\u987a\u5e8f\u4e3a\u7a7a\u3002"
                }
              </p>
            </div>
            <div className="text-xs text-stone-500">
              {"\u5171 "}
              {files.length}
              {" \u4e2a"}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {files.length === 0 ? (
            <p className="text-sm text-stone-500">
              {"\u6682\u65e0\u6587\u4ef6\u3002\u8bf7\u5148\u4e0a\u4f20 MP3\u3002"}
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">{"\u987a\u5e8f"}</th>
                    <th className="px-4 py-3 font-medium">{"\u6587\u4ef6\u540d"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {files.map((f) => (
                    <tr key={f.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {f.sort_order > 0 ? `#${f.sort_order}` : "\u2014"}
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
