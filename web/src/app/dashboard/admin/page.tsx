"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Stats = {
  totalUsers: number;
  todayUsers: number;
  totalTasks: number;
  todayTasks: number;
  todayProcessedTasks: number;
  totalFeedbacks: number;
  todayFeedbacks: number;
};

type RecentUser = {
  id: number;
  email: string;
  displayName: string | null;
  createdAt: string;
};

type RecentTask = {
  id: number;
  userId: number;
  email: string;
  audioTitle: string;
  status: string;
  processingStartedAt: string | null;
  createdAt: string;
};

type RecentFeedback = {
  id: number;
  userId: number;
  email: string;
  type: string;
  content: string;
  contact: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  usage: "使用问题",
  process_failed: "处理失败",
  download: "下载问题",
  feature_suggestion: "功能建议",
  other: "其他",
};

function typeLabel(type: string) {
  return TYPE_LABELS[type] || type;
}

const statCards: { key: keyof Stats; label: string }[] = [
  { key: "totalUsers", label: "总用户数" },
  { key: "todayUsers", label: "今日新增用户" },
  { key: "totalTasks", label: "总任务数" },
  { key: "todayTasks", label: "今日新建任务" },
  { key: "todayProcessedTasks", label: "今日已处理任务" },
  { key: "totalFeedbacks", label: "总反馈数" },
  { key: "todayFeedbacks", label: "今日反馈数" },
];

/**
 * 管理员数据看板（仅管理员接口返回数据）
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[] | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTask[] | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setForbidden(false);
    try {
      const res = await apiFetch("/admin/overview");
      const j = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setForbidden(true);
        setStats(null);
        setRecentUsers(null);
        setRecentTasks(null);
        setRecentFeedbacks(null);
        setErr(j?.message || "无权查看管理员数据");
        return;
      }
      if (!res.ok) {
        setStats(null);
        setRecentUsers(null);
        setRecentTasks(null);
        setRecentFeedbacks(null);
        setErr(j?.message || "加载失败，请稍后重试");
        return;
      }
      setStats(j.stats as Stats);
      setRecentUsers(Array.isArray(j.recentUsers) ? j.recentUsers : []);
      setRecentTasks(Array.isArray(j.recentTasks) ? j.recentTasks : []);
      setRecentFeedbacks(Array.isArray(j.recentFeedbacks) ? j.recentFeedbacks : []);
    } catch {
      setStats(null);
      setRecentUsers(null);
      setRecentTasks(null);
      setRecentFeedbacks(null);
      setErr("网络错误：无法连接服务器");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">数据看板</h1>
          <p className="mt-2 text-sm text-stone-600">
            用于观察小公开内测期间的注册、任务处理与反馈情况，仅管理员可见。
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={load} disabled={loading}>
          {loading ? "刷新中…" : "刷新"}
        </Button>
      </div>

      {loading && (
        <InlineNotice tone="info">
          <p className="font-medium">正在加载数据看板…</p>
          <p className="mt-1 text-sm text-sky-900/80">若数据较多，可能需要一两秒。</p>
        </InlineNotice>
      )}

      {forbidden && !loading && (
        <InlineNotice tone="danger">
          <p className="font-medium">无权访问</p>
          <p className="mt-1 text-sm text-red-900/80">{err || "无权查看管理员数据"}</p>
        </InlineNotice>
      )}

      {!forbidden && err && !loading && (
        <InlineNotice tone="danger">
          <div className="space-y-2">
            <p className="font-medium">加载失败</p>
            <p className="text-sm text-red-900/80">{err}</p>
            <Button type="button" variant="secondary" size="sm" onClick={load}>
              重试
            </Button>
          </div>
        </InlineNotice>
      )}

      {!loading && !forbidden && !err && stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(({ key, label }) => (
              <Card key={key}>
                <div className="p-4">
                  <p className="text-xs text-stone-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">
                    {stats[key]}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-stone-900">最近用户</h2>
              <p className="mt-1 text-xs text-stone-500">最近 10 个注册账号</p>
            </CardHeader>
            <CardBody>
              {recentUsers!.length === 0 ? (
                <p className="text-sm text-stone-500">暂无数据</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="bg-stone-50 text-xs text-stone-500">
                      <tr>
                        <th className="px-3 py-3 font-medium">时间</th>
                        <th className="px-3 py-3 font-medium">邮箱</th>
                        <th className="px-3 py-3 font-medium">昵称</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {recentUsers!.map((u) => (
                        <tr key={u.id}>
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-600">
                            {new Date(u.createdAt).toLocaleString()}
                          </td>
                          <td className="max-w-[220px] break-all px-3 py-3 text-stone-800">
                            {u.email}
                          </td>
                          <td className="max-w-[160px] break-words px-3 py-3 text-stone-700">
                            {u.displayName || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-stone-900">最近任务</h2>
              <p className="mt-1 text-xs text-stone-500">最近 20 条任务</p>
            </CardHeader>
            <CardBody>
              {recentTasks!.length === 0 ? (
                <p className="text-sm text-stone-500">暂无数据</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-stone-50 text-xs text-stone-500">
                      <tr>
                        <th className="px-3 py-3 font-medium">创建时间</th>
                        <th className="px-3 py-3 font-medium">用户邮箱</th>
                        <th className="px-3 py-3 font-medium">任务名</th>
                        <th className="px-3 py-3 font-medium">状态</th>
                        <th className="px-3 py-3 font-medium">已进入处理</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {recentTasks!.map((t) => (
                        <tr key={t.id} className="align-top">
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-600">
                            {new Date(t.createdAt).toLocaleString()}
                          </td>
                          <td className="max-w-[180px] break-all px-3 py-3 text-stone-800">
                            {t.email}
                          </td>
                          <td className="max-w-[200px] break-words px-3 py-3 text-stone-800">
                            {t.audioTitle}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="max-w-[200px] px-3 py-3 text-xs text-stone-600">
                            {t.processingStartedAt ? (
                              <span className="break-words">
                                是（{new Date(t.processingStartedAt).toLocaleString()}）
                              </span>
                            ) : (
                              "否"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-stone-900">最近反馈</h2>
              <p className="mt-1 text-xs text-stone-500">最近 20 条</p>
            </CardHeader>
            <CardBody>
              {recentFeedbacks!.length === 0 ? (
                <p className="text-sm text-stone-500">暂无数据</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-stone-50 text-xs text-stone-500">
                      <tr>
                        <th className="px-3 py-3 font-medium">时间</th>
                        <th className="px-3 py-3 font-medium">类型</th>
                        <th className="px-3 py-3 font-medium">用户邮箱</th>
                        <th className="px-3 py-3 font-medium">联系方式</th>
                        <th className="px-3 py-3 font-medium">内容</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {recentFeedbacks!.map((f) => (
                        <tr key={f.id} className="align-top">
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-600">
                            {new Date(f.createdAt).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-stone-800">
                            {typeLabel(f.type)}
                          </td>
                          <td className="max-w-[180px] break-all px-3 py-3 text-stone-800">
                            {f.email}
                          </td>
                          <td className="max-w-[120px] break-all px-3 py-3 text-stone-600">
                            {f.contact || "—"}
                          </td>
                          <td className="max-w-md px-3 py-3 text-stone-800">
                            <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                              {f.content}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
