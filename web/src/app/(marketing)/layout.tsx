export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { MarketingChrome } from "@/components/site/MarketingChrome";

/**
 * 官网布局：统一顶栏与页脚（与根路径首页共用 MarketingChrome）
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
