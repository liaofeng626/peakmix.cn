import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * 官网壳：顶栏 + 主内容 + 页脚（根路径与 (marketing) 子路由共用，避免首页漏套布局导致无 Tailwind 观感）
 */
export function MarketingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
