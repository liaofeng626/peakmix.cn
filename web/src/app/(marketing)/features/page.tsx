/**
 * 功能介绍页：把后台能力讲清楚（公开内测版）
 */
export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">功能</h1>
      <p className="mt-4 text-stone-600">
        PeakMix 提供一条清晰、可重复的工作流：上传多段自有 MP3 → 随机排序 → ffmpeg 拼接导出 → 下载成品 MP3 与 Excel 顺序表。
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {[
          {
            t: "创建任务",
            d: "为每次排练/活动建立一条“任务”，填写「本次音频名称」，后续所有文件都围绕这条任务产出与归档。",
            meta: "入口：后台 → 新建任务",
          },
          {
            t: "上传多个 MP3",
            d: "一次选择多段 MP3 批量上传（仅用于本次任务处理与下载）。文件名建议清晰，方便顺序表阅读与团队沟通。",
            meta: "支持多文件选择与批量上传",
          },
          {
            t: "随机排序",
            d: "服务端生成随机顺序并记录每段音频的顺序号，减少人工排版，适合训练与排练的“变化感”。",
            meta: "随机顺序会写入 Excel",
          },
          {
            t: "ffmpeg 拼接导出",
            d: "服务端使用 ffmpeg 将多段音频按随机顺序拼接成一个成品 MP3，便于拷贝到播放器或现场设备。",
            meta: "无需本地安装音频软件",
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
            "仅支持上传你有权使用的自有 MP3",
            "不提供公共曲库（不提供热门歌曲下载）",
            "不提供在线播放/试听",
            "不提供用户之间分享、传播或互动能力",
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
