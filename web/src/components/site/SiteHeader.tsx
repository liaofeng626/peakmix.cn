import Link from "next/link";

const nav = [
  { href: "/features", label: "功能" },
  { href: "/guide", label: "教程" },
  { href: "/pricing", label: "价格" },
];

/**
 * 官网顶部导航：简洁工具站风格
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-stone-900">
          PeakMix
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-stone-600 transition hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-stone-600 transition hover:text-stone-900"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            注册
          </Link>
        </div>
      </div>
    </header>
  );
}
