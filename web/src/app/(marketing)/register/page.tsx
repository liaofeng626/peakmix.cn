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
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">注册</h1>
      <p className="mt-2 text-sm text-stone-600">
        注册后可立即创建任务并上传音频，完成随机排序、拼接导出，并下载成品 MP3 与 Excel 顺序表。
      </p>
      <p className="mt-2 text-sm text-stone-600">
        已有账号？{" "}
        <Link href="/login" className="font-medium text-stone-900 underline">
          登录
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">邮箱</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
    </div>
  );
}
