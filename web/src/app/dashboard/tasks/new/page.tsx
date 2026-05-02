"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";

/** New task: title then upload on detail page */
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
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ audioTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "\u521b\u5efa\u5931\u8d25");
        return;
      }
      router.push(`/dashboard/tasks/${data.id}`);
    } catch {
      setErr("\u7f51\u7edc\u9519\u8bef");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{"\u65b0\u5efa\u4efb\u52a1"}</h1>
        <p className="mt-2 text-sm text-stone-600">
          {
            "\u4f60\u53ea\u9700\u8981\u5148\u7ed9\u300c\u6700\u7ec8\u6210\u54c1\u300d\u8d77\u4e2a\u540d\u5b57\u3002\u521b\u5efa\u540e\u8fdb\u5165\u4efb\u52a1\u8be6\u60c5\u9875\u4e0a\u4f20\u591a\u4e2a MP3\uff0c\u5e76\u4e00\u952e\u968f\u673a\u6392\u5e8f\u3001\u62fc\u63a5\u4e0e\u5bfc\u51fa\u3002"
          }
        </p>
      </div>

      <InlineNotice tone="info">
        <div className="space-y-1">
          <p className="font-medium">{"\u5408\u89c4\u8fb9\u754c"}</p>
          <p className="text-sm text-sky-900/80">
            {
              "PeakMix \u4e0d\u63d0\u4f9b\u516c\u5171\u66f2\u5e93\u3001\u5728\u7ebf\u64ad\u653e\u6216\u7528\u6237\u95f4\u5206\u4eab\u529f\u80fd\u3002\u8bf7\u4ec5\u4e0a\u4f20\u4f60\u62e5\u6709\u4f7f\u7528\u6743\u7684\u81ea\u6709\u97f3\u9891\u3002"
            }
          </p>
        </div>
      </InlineNotice>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">{"\u4efb\u52a1\u4fe1\u606f"}</h2>
            <p className="mt-1 text-xs text-stone-500">
              {
                "\u8fd9\u4e2a\u540d\u79f0\u4f1a\u5199\u5165 Excel \u987a\u5e8f\u8868\uff0c\u4e5f\u4f1a\u4f5c\u4e3a\u4e0b\u8f7d\u6587\u4ef6\u7684\u9ed8\u8ba4\u547d\u540d\u53c2\u8003\u3002"
              }
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  {"\u672c\u6b21\u97f3\u9891\u540d\u79f0"}
                </label>
                <input
                  required
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder={
                    "\u4f8b\u5982\uff1a\u4e94\u4e00\u6c47\u6f14\u6392\u7ec3\u5408\u96c6"
                  }
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
                  {loading ? "\u521b\u5efa\u4e2d..." : "\u521b\u5efa\u5e76\u8fdb\u5165\u4e0a\u4f20"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => router.push("/dashboard/tasks")}
                >
                  {"\u8fd4\u56de\u4efb\u52a1\u5217\u8868"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-stone-900">{"\u5904\u7406\u6b65\u9aa4"}</h2>
            <p className="mt-1 text-xs text-stone-500">
              {"\u6e05\u6670\u544a\u8bc9\u4f60\u63a5\u4e0b\u6765\u4f1a\u53d1\u751f\u4ec0\u4e48\u3002"}
            </p>
          </CardHeader>
          <CardBody>
            <ol className="space-y-3 text-sm text-stone-700">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                  1
                </span>
                <div>
                  <p className="font-medium text-stone-900">{"\u4e0a\u4f20\u591a\u4e2a MP3"}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {"\u4ec5\u7528\u4e8e\u672c\u6b21\u4efb\u52a1\u5904\u7406\u4e0e\u4e0b\u8f7d\u3002"}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                  2
                </span>
                <div>
                  <p className="font-medium text-stone-900">{"\u968f\u673a\u6392\u5e8f"}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {
                      "\u7cfb\u7edf\u4f1a\u751f\u6210\u4e00\u4e2a\u968f\u673a\u987a\u5e8f\u5e76\u5199\u5165 Excel\u3002"
                    }
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                  3
                </span>
                <div>
                  <p className="font-medium text-stone-900">{"ffmpeg \u62fc\u63a5\u5bfc\u51fa"}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {
                      "\u8f93\u51fa\u6210\u54c1 MP3 + Excel \u987a\u5e8f\u8868\uff08\u4e0d\u63d0\u4f9b\u5728\u7ebf\u64ad\u653e\uff09\u3002"
                    }
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
