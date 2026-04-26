import Link from "next/link";

/**
 * 首页：面向公开内测的产品说明与入口
 */
export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-stone-200 to-white blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-60" />
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              舞蹈活动 · 自有音频拼接工具
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              面向舞蹈活动的自有 MP3 拼接导出工具
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
              上传多个 MP3 → 随机排序 → 拼接导出 → 下载成品 MP3 与 Excel 顺序表。PeakMix 只做“处理与导出”，不提供公共曲库，也不提供在线播放。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/30"
              >
                开始使用
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              >
                查看功能
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center rounded-full px-2 py-3 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                如何使用 →
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 text-xs text-stone-600">
              {["不提供公共曲库", "不提供在线播放", "仅支持自有 MP3", "当前为内测版本"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-stone-900">处理流程（不提供在线播放）</p>
            <div className="mt-4 space-y-3">
              {[
                { k: "上传", v: "多段 MP3（你的自有文件）" },
                { k: "处理", v: "随机排序 → ffmpeg 拼接" },
                { k: "导出", v: "成品 MP3 + Excel 顺序表" },
              ].map((x) => (
                <div
                  key={x.k}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <span className="text-sm font-medium text-stone-900">{x.k}</span>
                  <span className="text-sm text-stone-600">{x.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-xs text-stone-600">
              处理完成后在后台下载文件（成品 MP3 与 Excel 顺序表）。当前为内测版本，体验与细节会持续优化。
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">核心能力</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            面向舞蹈排练与活动串烧的“任务式”工作流：批量上传你的自有 MP3，系统随机排序并拼接导出，再把结果下载带走。
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "批量上传",
                d: "一次选择多个 MP3 上传到同一条任务，减少重复操作。",
              },
              {
                t: "自动随机顺序",
                d: "服务端生成随机顺序并记录顺序号，适合训练与排练的“变化感”。",
              },
              {
                t: "导出 MP3 + Excel",
                d: "成品 MP3 便于现场使用；Excel 顺序表便于对照、归档与沟通。",
              },
              {
                t: "边界清晰",
                d: "不提供公共曲库、不提供在线播放；仅处理你有权使用的自有音频。",
              },
            ].map((x) => (
              <li
                key={x.t}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm"
              >
                <h3 className="font-medium text-stone-900">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{x.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-stone-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            为什么适合舞蹈活动
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            你需要的是“排练与活动现场的音频工具”，而不是一个音乐平台。PeakMix 聚焦任务制：上传自有 MP3 →
            随机排序 → 拼接导出 → 下载结果。
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "随机排序",
                d: "用随机顺序制造排练变化，避免固定顺序带来的惯性。",
              },
              {
                t: "一键拼接",
                d: "服务端 ffmpeg 拼接为单一成品 MP3，便于拷贝到播放器或现场设备。",
              },
              {
                t: "顺序表导出",
                d: "自动生成 Excel：本次音频名称、顺序号、原始文件名。",
              },
            ].map((x) => (
              <li
                key={x.t}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-medium text-stone-900">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{x.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">三步完成</h2>
            <ol className="mt-8 space-y-4 text-stone-600">
              {[
                "注册并登录，创建任务并填写「本次音频名称」。",
                "上传多段自有 MP3（仅用于本次任务处理与下载）。",
                "开始处理：随机排序 → 拼接导出 → 下载成品 MP3 与 Excel 顺序表。",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <h3 className="text-sm font-medium text-stone-900">使用前说明（边界）</h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              {[
                "仅支持上传你有权使用的自有 MP3",
                "不提供公共曲库，也不提供热门歌曲下载",
                "不提供在线播放/试听",
                "不提供用户之间分享、传播或互动能力",
                "只做：上传 → 随机排序 → 拼接导出 → 下载成品 MP3 与 Excel",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-xs text-stone-600">
              当前为公开内测版本：界面与细节会持续打磨，但核心流程已可完整使用。
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">适合哪些场景</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            PeakMix 更像一个“活动团队工具”。如果你手上已经有一堆自有 MP3，只想快速随机排序并导出成品，它会很顺手。
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "舞蹈排练", d: "用随机顺序提升适应性与专注度。" },
              { t: "活动串烧", d: "多段音频拼成一个文件，现场更省事。" },
              { t: "课堂训练", d: "按训练节奏准备不同组合的音频。" },
              { t: "小型演出排练", d: "导出 MP3 + 顺序表，便于团队沟通与归档。" },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <p className="text-sm font-medium text-stone-900">{x.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              准备开始做第一条成品音频？
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-stone-600">
              进入后台创建任务，上传你的 MP3，然后一键导出成品 MP3 与 Excel 顺序表。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/30"
              >
                开始使用
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              >
                我已注册，去登录
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
