/**
 * 教程页：3 分钟上手（公开内测版）
 */
export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">使用教程</h1>
      <p className="mt-4 text-stone-600">
        第一次使用也没关系。照着下面做，你可以在几分钟内完成一次“上传 → 随机排序 → 拼接导出 → 下载”的完整流程。
      </p>

      <ol className="mt-10 space-y-6 text-sm text-stone-600">
        <li>
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
              1
            </span>
            <div>
              <p className="font-medium text-stone-900">注册 / 登录</p>
              <p className="mt-1 leading-relaxed">
                先完成注册或登录。登录后你会进入后台，可以创建任务、上传 MP3 并处理导出。
              </p>
            </div>
          </div>
        </li>
        <li>
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
              2
            </span>
            <div>
              <p className="font-medium text-stone-900">创建任务</p>
              <p className="mt-1 leading-relaxed">
                后台 → 新建任务 → 填写「本次音频名称」。这个名称会写进 Excel 顺序表，也会影响下载文件的默认命名。
              </p>
            </div>
          </div>
        </li>
        <li>
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
              3
            </span>
            <div>
              <p className="font-medium text-stone-900">上传多个 MP3</p>
              <p className="mt-1 leading-relaxed">
                在任务详情页选择多个 `.mp3` 文件上传。建议文件名尽量清晰（例如包含舞种/节拍/段落），后续顺序表更好读。
              </p>
            </div>
          </div>
        </li>
        <li>
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
              4
            </span>
            <div>
              <p className="font-medium text-stone-900">点击处理：随机排序 → 拼接导出</p>
              <p className="mt-1 leading-relaxed">
                点击“开始处理”。系统会先生成随机顺序，再用 ffmpeg 拼接导出。处理中请耐心等待，必要时可刷新状态。
              </p>
            </div>
          </div>
        </li>
        <li>
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
              5
            </span>
            <div>
              <p className="font-medium text-stone-900">下载成品 MP3 与 Excel 顺序表</p>
              <p className="mt-1 leading-relaxed">
                状态变为“已完成”后，下载两个文件：成品 MP3 与 Excel 顺序表（包含顺序号与原始文件名）。
              </p>
            </div>
          </div>
        </li>
      </ol>

      <div className="mt-12 rounded-2xl border border-stone-200 bg-stone-50 p-6">
        <h2 className="text-sm font-medium text-stone-900">常见提醒</h2>
        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          {[
            "文件名尽量清晰：顺序表会直接展示原始文件名。",
            "仅上传你有权使用的自有 MP3：PeakMix 不提供公共曲库。",
            "不提供在线播放/试听：处理结果请以下载文件为准。",
            "当前为内测版本：我们会持续优化体验与细节。",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-medium text-stone-900">常见问题（FAQ）</h2>
        <div className="mt-5 space-y-5 text-sm text-stone-600">
          {[
            {
              q: "为什么需要上传自己的 MP3？",
              a: "PeakMix 是工具站，不是音乐平台。为了合规与边界清晰，我们只处理你自己有权使用的自有音频文件。",
            },
            {
              q: "为什么没有公共曲库？",
              a: "公共曲库会引入版权、审核与分发问题，容易让产品变成“音乐平台”。PeakMix 选择专注在“处理与导出”这件事上。",
            },
            {
              q: "为什么会生成 Excel 顺序表？",
              a: "随机排序后，团队往往需要对照：第几段是什么、原始文件名是什么。Excel 顺序表用来归档、沟通与复盘。",
            },
            {
              q: "为什么当前是内测版？",
              a: "我们希望先把核心流程打磨稳定，再逐步完善细节与扩展能力（例如更高配额、更多导出选项等）。",
            },
          ].map((x) => (
            <div key={x.q}>
              <p className="font-medium text-stone-900">{x.q}</p>
              <p className="mt-1 leading-relaxed">{x.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
