import Link from "next/link";

/**
 * 页脚：备案与公安备案占位（上线后替换为真实编号与链接）
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-900">PeakMix</p>
            <p className="mt-2 max-w-sm text-sm text-stone-600">
              面向舞蹈活动场景的音频拼接工具。不提供公共曲库与在线播放。
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-stone-600">
            <Link href="/features" className="hover:text-stone-900">
              功能介绍
            </Link>
            <Link href="/pricing" className="hover:text-stone-900">
              价格方案
            </Link>
            <Link href="/guide" className="hover:text-stone-900">
              使用教程
            </Link>
            <Link href="/login" className="hover:text-stone-900">
              用户登录
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
