import { DashboardGate } from "@/components/dashboard/DashboardGate";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

/**
 * 用户后台布局：侧栏 + 主内容区（需登录）
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGate>
      <div className="flex min-h-screen bg-stone-50 text-stone-900">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
        </div>
      </div>
    </DashboardGate>
  );
}
