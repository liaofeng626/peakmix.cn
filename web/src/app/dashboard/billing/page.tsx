"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

/**
 * 会员中心：展示 memberships 与 payments（第一版可为空列表）
 */
export default function BillingPage() {
  const [data, setData] = useState<{
    memberships: Array<{
      plan_code: string;
      status: string;
      started_at: string;
      ended_at: string | null;
    }>;
    payments: Array<{
      id: number;
      amount_cents: number;
      currency: string;
      status: string;
      created_at: string;
    }>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch("/api/v1/billing/summary");
      const j = await res.json();
      if (!cancelled && res.ok) setData(j);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return <p className="text-sm text-stone-500">加载中…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">会员中心</h1>
      <p className="mt-2 text-sm text-stone-600">查看套餐记录与支付流水（占位）。</p>

      <h2 className="mt-10 text-sm font-medium text-stone-900">会员记录</h2>
      {data.memberships.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">暂无记录</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          {data.memberships.map((m, i) => (
            <li key={i} className="rounded-lg border border-stone-200 bg-white px-3 py-2">
              {m.plan_code} · {m.status}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-sm font-medium text-stone-900">支付记录</h2>
      {data.payments.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">暂无支付记录</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          {data.payments.map((p) => (
            <li key={p.id} className="rounded-lg border border-stone-200 bg-white px-3 py-2">
              {(p.amount_cents / 100).toFixed(2)} {p.currency} · {p.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
