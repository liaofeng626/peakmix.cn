"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

/**
 * 账号设置：修改展示昵称
 */
export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch("/auth/me");
      const data = await res.json();
      if (!cancelled && res.ok) {
        setEmail(data.user.email);
        setDisplayName(data.user.displayName || "");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName: displayName || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "保存失败");
        return;
      }
      setMsg("已保存");
    } catch {
      setMsg("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">账号设置</h1>
      <p className="mt-2 text-sm text-stone-600">更新你的展示信息（邮箱暂不可在此修改）。</p>

      <form onSubmit={onSave} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">邮箱</label>
          <input
            readOnly
            value={email}
            className="mt-1 w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">昵称</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-stone-900 focus:ring-2"
          />
        </div>
        {msg && <p className="text-sm text-stone-600">{msg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "保存中…" : "保存"}
        </button>
      </form>
    </div>
  );
}
