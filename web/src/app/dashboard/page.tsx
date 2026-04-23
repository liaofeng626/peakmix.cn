"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Me = {
  user: { id: number; email: string; displayName: string | null };
  membership: { plan_code: string; status: string; ended_at: string | null };
};

/**
 * 后台首页：展示会员状态与快捷入口
 */
export default function DashboardHomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch("/auth/me");
      const data = await res.json();
      if (!res.ok) {
        if (!cancelled) setErr(data.message || "加载失败");
        return;
      }
      if (!cancelled) setMe(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return <p className="text-sm text-red-600">{err}</p>;
  }
  if (!me) {
    return <p className="text-sm text-stone-500">加载中…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">欢迎回来</h1>
      <p className="mt-2 text-sm text-stone-600">
        {me.user.displayName || me.user.email}
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-medium text-stone-900">会员状态</h2>
        <dl className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">套餐</dt>
            <dd className="font-medium text-stone-900">{me.membership.plan_code}</dd>
          </div>
          <div>
            <dt className="text-stone-500">状态</dt>
            <dd className="font-medium text-stone-900">{me.membership.status}</dd>
          </div>
        </dl>
        <Link
          href="/dashboard/billing"
          className="mt-4 inline-block text-sm font-medium text-stone-900 underline"
        >
          查看账单与记录
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard/tasks/new"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          新建音频任务
        </Link>
        <Link
          href="/dashboard/tasks"
          className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-800"
        >
          我的任务列表
        </Link>
      </div>
    </div>
  );
}
