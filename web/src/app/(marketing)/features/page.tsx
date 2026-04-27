/**
 * 功能说明页：把后台能力讲清楚（公开内测版）
 */
export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">功能说明</h1>
      <p className="mt-4 text-stone-600">
        PeakMix 是一套“上传 → 处理 → 导出”的工具流程：上传多段自有 MP3 → 服务端随机排序 → ffmpeg 拼接导出 →
        下载成品 MP3 与 Excel 顺序表。当前为内测版本。
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {[
          {
            t: "创建任务",
            d: "每次排练/活动对应一条“任务”。你只需要填「本次音频名称」，后续上传、处理、导出都会归到这条任务下面，方便管理与复用。",
            meta: "后台：新建任务 → 填写「本次音频名称」",
          },
          {
            t: "上传多个 MP3（仅自有）",
            d: "在同一条任务里一次性选择多个 `.mp3` 上传。系统只处理你自己有权使用的自有音频，不提供公共曲库，也不提供在线播放。",
            meta: "建议：文件名清晰（舞种/节拍/段落），顺序表更好读",
          },
          {
            t: "服务端随机排序（可追溯）",
            d: "随机顺序由服务端生成，并会把每段音频对应的顺序号记录下来。这样你拿到成品音频的同时，也能知道每一段的来源与顺序。",
            meta: "输出：Excel 顺序表（包含顺序号与原始文件名）",
          },
          {
            t: "ffmpeg 拼接导出（在服务器完成）",
            d: "处理在服务器完成：按随机顺序把多段音频拼接成一个成品 MP3。你不需要在本地安装剪辑软件；处理完成后直接下载结果文件。",
            meta: "说明：不提供在线播放/试听，结果以下载文件为准",
          },
          {
            t: "下载成品 MP3",
            d: "处理完成后可直接下载成品 MP3。不提供在线播放/试听，以确保工具属性与使用边界清晰。",
            meta: "下载：任务详情页",
          },
          {
            t: "下载 Excel 顺序表",
            d: "自动生成 Excel 顺序表：包含「本次音频名称 / 顺序号 / 原始文件名」，便于复盘、归档与对照。",
            meta: "适合团队排练与活动现场沟通",
          },
          {
            t: "任务与文件的后台管理",
            d: "所有上传文件、随机后的顺序、处理状态与导出文件都会绑定到你的账号与任务。登录后在后台查看任务列表与详情，随时重新下载导出结果。",
            meta: "权限：登录后仅能访问自己的任务数据",
          },
          {
            t: "处理边界清晰（合规优先）",
            d: "PeakMix 不是音乐平台：不提供公共曲库，不做歌曲分发，不提供在线播放，也不提供用户间分享。我们只做你自有音频的处理与导出。",
            meta: "如果你没有对应音频的使用权，请不要上传",
          },
          {
            t: "会员中心（占位）",
            d: "第一版提供套餐展示与订单记录占位，用于后续扩展更高配额、优先处理等能力（当前不接支付）。",
            meta: "入口：后台 → 会员中心",
          },
          {
            t: "账号设置",
            d: "查看账号信息并修改昵称（第一版仅昵称）。退出登录也在这里可快速完成。",
            meta: "入口：后台 → 账号设置",
          },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="font-medium text-stone-900">{x.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{x.d}</p>
            <p className="mt-3 text-xs text-stone-500">{x.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-medium text-stone-900">边界说明（统一口径）</h2>
        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          {[
            "仅支持上传你有权使用的自有 MP3（不接收来源不明或无使用权音频）",
            "不提供公共曲库（不提供热门歌曲下载/搜索）",
            "不提供在线播放/试听（处理完成后以下载文件为准）",
            "不提供用户之间分享、传播或互动能力",
            "当前为内测版本：流程可用，体验与细节会持续优化",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
