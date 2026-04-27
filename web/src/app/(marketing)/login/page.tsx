"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

/**
 * 登录页：成功后写入 JWT 并跳转后台首页
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "邮箱或密码不正确，请检查后再试");
        return;
      }
      setToken(data.token);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErr("网络有点问题，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr,0.95fr] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">公开内测</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">登录</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
            登录后进入任务后台：创建任务、上传自有 MP3、随机排序并拼接导出，然后下载成品 MP3 与 Excel 顺序表。
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                t: "你将获得什么",
                items: [
                  "任务式管理：一次活动一条任务，数据更清晰",
                  "服务端处理：随机排序与拼接在服务器完成",
                  "两份导出：成品 MP3 + Excel 顺序表",
                ],
              },
              {
                t: "边界说明（统一口径）",
                items: [
                  "仅支持上传你有权使用的自有 MP3",
                  "不提供公共曲库",
                  "不提供在线播放/试听",
                  "当前为内测版本",
                ],
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <p className="text-sm font-medium text-stone-900">{x.t}</p>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  {x.items.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-stone-600">
            还没有账号？{" "}
            <Link href="/register" className="font-medium text-stone-900 underline">
              去注册
            </Link>
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-stone-900">使用邮箱登录</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-stone-900 focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">密码</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-stone-900 focus:ring-2"
              />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-stone-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "登录中…" : "登录"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-xs leading-relaxed text-stone-600">
            说明：PeakMix 不提供在线播放/试听。处理完成后，请下载成品文件在你自己的播放器/设备中使用与确认。
          </div>
        </div>
      </div>
    </div>
  );
}
