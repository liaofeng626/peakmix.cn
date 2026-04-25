"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

/**
 * 账号设置（第一版）
 * - 查看账号信息：昵称 / 邮箱 / 注册时间
 * - 修改昵称：仅支持 displayName
 * - 修改密码：占位说明（不接真实修改）
 * - 退出登录：清除本地 Token 并跳转登录页
 */
export default function SettingsPage() {
  const router = useRouter();

  type UserMe = {
    id: number;
    email: string;
    displayName: string | null;
    createdAt?: string;
  };

  function pickDisplayName(x: unknown): string | null | undefined {
    if (!x || typeof x !== "object") return undefined;
    if ("displayName" in x && (x as { displayName?: unknown }).displayName != null) {
      const v = (x as { displayName?: unknown }).displayName;
      return typeof v === "string" ? v : null;
    }
    if ("display_name" in x && (x as { display_name?: unknown }).display_name != null) {
      const v = (x as { display_name?: unknown }).display_name;
      return typeof v === "string" ? v : null;
    }
    return undefined;
  }

  const [user, setUser] = useState<UserMe | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "warn" | "danger"; text: string } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 优先使用更稳定的 /users/me（包含 createdAt）
        const res = await apiFetch("/users/me");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErr(data?.message || "加载失败，请稍后重试");
          return;
        }
        const u = data as UserMe;
        if (!cancelled) {
          setUser(u);
          setDisplayName(u.displayName || "");
        }
      } catch {
        setErr("网络错误：无法连接服务器");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setSaving(true);
    try {
      // 注意：apiFetch 会自动拼接 /api/v1，这里不要手写前缀
      const res = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName: displayName || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ tone: "danger", text: data?.message || "保存失败，请稍后重试" });
        return;
      }
      // PATCH 返回可能带 user，也可能带顶层字段，这里都兼容一下
      const updated = (data?.user
        ? {
            id: data.user.id,
            email: data.user.email,
            displayName: data.user.display_name ?? data.user.displayName ?? null,
          }
        : data) as Partial<UserMe>;
      setUser((prev) => ({
        id: updated.id ?? prev?.id ?? 0,
        email: updated.email ?? prev?.email ?? "",
        displayName:
          pickDisplayName(updated) ?? pickDisplayName(data) ?? prev?.displayName ?? null,
        createdAt: prev?.createdAt,
      }));
      setNotice({ tone: "success", text: "已保存：昵称更新成功" });
    } catch {
      setNotice({ tone: "danger", text: "网络错误：保存失败" });
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">账号设置</h1>
          <p className="mt-2 text-sm text-stone-600">
            在这里管理你的基础账号信息。第一版不做邮箱验证与复杂安全校验，但保留了可扩展结构。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={logout}>
            退出登录
          </Button>
        </div>
      </div>

      {loading && (
        <InlineNotice tone="info">
          <div className="space-y-1">
            <p className="font-medium">正在加载账号信息…</p>
            <p className="text-sm text-sky-900/80">如果你刚登录，可能需要几秒钟。</p>
          </div>
        </InlineNotice>
      )}

      {err && (
        <InlineNotice tone="danger">
          <div className="space-y-2">
            <p className="font-medium">加载失败</p>
            <p className="text-sm text-red-900/80">{err}</p>
            <div className="pt-1">
              <Button type="button" variant="secondary" size="sm" onClick={() => location.reload()}>
                刷新页面重试
              </Button>
            </div>
          </div>
        </InlineNotice>
      )}

      {notice && <InlineNotice tone={notice.tone}>{notice.text}</InlineNotice>}

      {user && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-stone-900">账号信息</h2>
              <p className="mt-1 text-xs text-stone-500">用于展示与登录的基础信息（邮箱第一版不支持修改）。</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-stone-500">邮箱</p>
                  <p className="mt-1 text-sm font-medium text-stone-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">昵称</p>
                  <p className="mt-1 text-sm font-medium text-stone-900">
                    {user.displayName || "未设置"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">注册时间</p>
                  <p className="mt-1 text-sm font-medium text-stone-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "暂不可用"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-stone-900">修改昵称</h2>
              <p className="mt-1 text-xs text-stone-500">
                昵称会在任务列表、下载文件提示等位置展示。第一版仅做基础修改。
              </p>
            </CardHeader>
            <CardBody>
              <form onSubmit={onSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700">新昵称</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="例如：小峰 / PeakMix 用户"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-stone-900/30 focus:ring-2"
                  />
                  <p className="mt-2 text-xs text-stone-500">留空则表示不设置昵称（仅显示邮箱）。</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? "保存中…" : "保存修改"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={saving}
                    onClick={() => {
                      setDisplayName(user.displayName || "");
                      setNotice({ tone: "warn", text: "已恢复为当前保存的昵称（未提交保存）" });
                    }}
                  >
                    取消更改
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-stone-900">修改密码（占位）</h2>
              <p className="mt-1 text-xs text-stone-500">第一版暂不提供密码修改与邮箱验证功能。</p>
            </CardHeader>
            <CardBody>
              <InlineNotice tone="info">
                <div className="space-y-1">
                  <p className="font-medium">后续计划</p>
                  <p className="text-sm text-sky-900/80">
                    我们会在这里加入：修改密码、登录设备管理、以及更完善的安全提示（例如异常登录提醒）。
                  </p>
                </div>
              </InlineNotice>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
