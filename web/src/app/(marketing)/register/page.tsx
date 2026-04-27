"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

/**
 * 注册页：创建用户与默认 free 会员，签发 JWT
 */
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "注册没成功，请检查信息后再试");
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">注册</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
            注册后会自动登录，你可以立即创建任务并上传音频，完成随机排序、拼接导出，并下载成品 MP3 与 Excel 顺序表。
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                t: "注册前你需要知道",
                items: [
                  "仅支持上传你有权使用的自有 MP3",
                  "不提供公共曲库",
                  "不提供在线播放/试听",
                  "当前为内测版本",
                ],
              },
              {
                t: "注册后你可以做什么",
                items: [
                  "创建任务：为一次排练/活动建立清晰的工作区",
                  "上传多段 MP3：批量上传到同一任务",
                  "一键处理：随机排序 → ffmpeg 拼接导出",
                  "下载两份结果：成品 MP3 + Excel 顺序表",
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
            已有账号？{" "}
            <Link href="/login" className="font-medium text-stone-900 underline">
              去登录
            </Link>
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-stone-900">创建账号</p>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-stone-900 focus:ring-2"
              />
              <p className="mt-2 text-xs text-stone-500">密码至少 8 位。建议包含字母与数字，方便记忆也更安全。</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">昵称（可选）</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="用于后台展示"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-stone-900 focus:ring-2"
              />
              <p className="mt-2 text-xs text-stone-500">
                昵称会在后台页面中展示（例如任务列表）。不填也可以，后续可在“账号设置”里修改。
              </p>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-stone-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "提交中…" : "创建账号"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-xs leading-relaxed text-stone-600">
            注册即表示你确认：上传内容为你有权使用的自有 MP3。PeakMix 不提供公共曲库，不提供在线播放/试听。
          </div>
        </div>
      </div>
    </div>
  );
}
