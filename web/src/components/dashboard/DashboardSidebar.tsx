"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "概览" },
  { href: "/dashboard/tasks/new", label: "新建任务" },
  { href: "/dashboard/tasks", label: "任务列表" },
  { href: "/dashboard/billing", label: "会员中心" },
  { href: "/dashboard/feedback", label: "反馈问题" },
  { href: "/dashboard/feedbacks", label: "内测反馈" },
  { href: "/dashboard/settings", label: "账号设置" },
];

/**
 * 后台侧栏导航 + 退出登录
 */
export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-4">
        <Link href="/" className="text-sm font-semibold text-stone-900">
          PeakMix
        </Link>
        <p className="mt-1 text-xs text-stone-500">用户后台</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((l) => {
          // 任务详情 /dashboard/tasks/[id] 归入「任务列表」高亮
          const active =
            l.href === "/dashboard/tasks"
              ? pathname === "/dashboard/tasks" || /^\/dashboard\/tasks\/\d+$/.test(pathname)
              : pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-200 p-3">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-100"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
