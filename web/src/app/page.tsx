import { HomePageContent } from "@/components/site/HomePageContent";
import { MarketingChrome } from "@/components/site/MarketingChrome";

/**
 * 站点根路径 /：显式挂在 app 根下，确保与根 layout 的 globals.css / Tailwind 一致，
 * 避免仅落在路由组内时部分部署环境下首页未套用营销壳、出现「纯 HTML」观感。
 */
export default function RootHomePage() {
  return (
    <MarketingChrome>
      <HomePageContent />
    </MarketingChrome>
  );
}
