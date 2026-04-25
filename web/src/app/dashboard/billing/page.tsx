"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * 会员中心（第一版）
 * - 不接真实支付，仅展示：当前套餐 + 权益说明 + 升级按钮占位 + 订单记录占位
 */
export default function BillingPage() {
  type BillingOverview = {
    plan: "free" | "pro";
    status: "active" | "expired" | "inactive";
    expiresAt: string | null;
    orders: Array<{
      id: number;
      amountCents: number;
      currency: string;
      status: string;
      createdAt: string;
    }>;
  };

  const [data, setData] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      // 注意：apiFetch 会自动拼接 /api/v1，这里不要手写前缀
      const res = await apiFetch("/billing/overview");
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j?.message || "加载失败，请稍后重试");
        return;
      }
      setData(j as BillingOverview);
    } catch {
      setErr("网络错误：无法连接服务器");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planLabel = data?.plan === "pro" ? "会员版（Pro）" : "免费版（Free）";
  const planDesc =
    data?.plan === "pro"
      ? "适合高频使用与团队协作场景（第一版仅展示，暂不接支付）。"
      : "适合轻量试用与低频使用。你依然可以完整体验创建任务、上传、处理与下载流程。";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">会员中心</h1>
          <p className="mt-2 text-sm text-stone-600">
            在这里查看当前套餐与权益说明。第一版暂不接支付，但页面与接口已按可扩展结构搭好。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={load} disabled={loading}>
            {loading ? "刷新中…" : "刷新"}
          </Button>
        </div>
      </div>

      {loading && (
        <InlineNotice tone="info">
          <div className="space-y-1">
            <p className="font-medium">正在加载会员信息…</p>
            <p className="text-sm text-sky-900/80">如果你刚登录或刚切换网络，可能需要几秒钟。</p>
          </div>
        </InlineNotice>
      )}

      {err && (
        <InlineNotice tone="danger">
          <div className="space-y-2">
            <p className="font-medium">加载失败</p>
            <p className="text-sm text-red-900/80">{err}</p>
            <div className="pt-1">
              <Button type="button" variant="secondary" size="sm" onClick={load}>
                重试
              </Button>
            </div>
          </div>
        </InlineNotice>
      )}

      {notice && <InlineNotice tone="warn">{notice}</InlineNotice>}

      {data && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-stone-900">当前套餐</h2>
                  <p className="mt-1 text-xs text-stone-500">{planDesc}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={data.status} />
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs text-stone-500">套餐</p>
                  <p className="mt-1 text-sm font-medium text-stone-900">{planLabel}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs text-stone-500">到期时间</p>
                  <p className="mt-1 text-sm font-medium text-stone-900">
                    {data.expiresAt ? new Date(data.expiresAt).toLocaleString() : "不设到期（当前为占位逻辑）"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() =>
                    setNotice("“升级会员”功能正在开发中：第一版仅做展示与占位，不会产生真实支付。")
                  }
                >
                  升级会员（占位）
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNotice("你当前可以继续使用免费版功能；后续我们会在这里提供更清晰的升级路径。")}
                >
                  了解权益
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-sm font-medium text-stone-900">免费版 vs 会员版</h2>
                <p className="mt-1 text-xs text-stone-500">
                  这是第一版的权益草案：先把结构做对，后续可按运营策略调整。
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs text-stone-500">免费版（Free）</p>
                    <ul className="mt-3 space-y-2 text-sm text-stone-700">
                      <li>创建任务与上传 MP3</li>
                      <li>随机排序 + 拼接导出</li>
                      <li>下载成品 MP3 与 Excel</li>
                      <li className="text-stone-500">（未来可加：每日次数限制）</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-900 p-4 text-white">
                    <p className="text-xs text-white/70">会员版（Pro）</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/90">
                      <li>更高的处理额度（占位）</li>
                      <li>更快的排队优先级（占位）</li>
                      <li>更长的下载保留期（占位）</li>
                      <li className="text-white/70">（未来可加：团队空间/共享模板）</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-sm font-medium text-stone-900">订单记录</h2>
                <p className="mt-1 text-xs text-stone-500">
                  第一版不接支付，这里用于占位与联调，后续可对接真实支付平台。
                </p>
              </CardHeader>
              <CardBody>
                {data.orders.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-600">暂无订单记录</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-stone-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 text-xs text-stone-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">时间</th>
                          <th className="px-4 py-3 font-medium">金额</th>
                          <th className="px-4 py-3 font-medium">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {data.orders.map((o) => (
                          <tr key={o.id} className="bg-white">
                            <td className="px-4 py-3 text-stone-700">
                              {new Date(o.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-medium text-stone-900">
                              {(o.amountCents / 100).toFixed(2)} {o.currency}
                            </td>
                            <td className="px-4 py-3 text-stone-700">{o.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
