import Link from "next/link";

/**
 * 价格页（占位，后续可对接支付与套餐表）
 */
export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">价格</h1>
      <p className="mt-4 text-stone-600">
        以下为占位方案，实际上线时请根据会员表（memberships）与支付流水（payments）配置。
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-8">
          <h2 className="text-lg font-semibold">免费版</h2>
          <p className="mt-4 text-4xl font-semibold">¥0</p>
          <ul className="mt-6 space-y-2 text-sm text-stone-600">
            <li>每月 N 次任务（占位）</li>
            <li>单任务最多 M 个文件（占位）</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-stone-900 bg-stone-900 p-8 text-white">
          <h2 className="text-lg font-semibold">专业版</h2>
          <p className="mt-4 text-4xl font-semibold">待定</p>
          <ul className="mt-6 space-y-2 text-sm text-stone-200">
            <li>更高配额（占位）</li>
            <li>发票/对公（占位）</li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-sm text-stone-500">
        注册后即可在{" "}
        <Link href="/dashboard/billing" className="underline underline-offset-2">
          会员中心
        </Link>{" "}
        查看当前套餐状态。
      </p>
    </div>
  );
}
