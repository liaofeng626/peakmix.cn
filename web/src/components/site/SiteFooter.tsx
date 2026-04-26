import Link from "next/link";

/**
 * 页脚：备案与公安备案占位（上线后替换为真实编号与链接）
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-stone-900">PeakMix</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
              面向舞蹈活动场景的音频拼接工具：上传自有 MP3 → 随机排序 → 拼接导出 → 下载成品 MP3 与 Excel 顺序表。
            </p>
            <p className="mt-3 text-xs text-stone-500">
              边界：不提供公共曲库，不提供在线播放，不做用户间分享。仅支持上传你有权使用的自有音频。
            </p>
            <p className="mt-3 text-xs text-stone-500">当前为内测版本，体验与细节会持续优化。</p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-stone-600">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              产品简介
            </p>
            <Link href="/" className="hover:text-stone-900">
              首页
            </Link>
            <Link href="/features" className="hover:text-stone-900">
              功能介绍
            </Link>
            <Link href="/guide" className="hover:text-stone-900">
              使用教程
            </Link>
            <Link href="/pricing" className="hover:text-stone-900">
              价格
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-sm text-stone-600">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              用户登录
            </p>
            <Link href="/login" className="hover:text-stone-900">
              登录
            </Link>
            <Link href="/register" className="hover:text-stone-900">
              注册
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-200 pt-6 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} PeakMix. 保留所有权利。</p>
          <p className="mt-2">
            <span className="mr-4">ICP 备案号：（请在此处填写）</span>
            <span>公安备案：（请在此处填写）</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
