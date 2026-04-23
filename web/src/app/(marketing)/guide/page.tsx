/**
 * 教程页（占位步骤）
 */
export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">使用教程</h1>
      <ol className="mt-10 list-decimal space-y-6 pl-5 text-sm text-stone-600">
        <li>
          <span className="font-medium text-stone-900">准备文件</span>
          <p className="mt-1">仅使用你有版权或已获授权的 MP3，按排练需要命名。</p>
        </li>
        <li>
          <span className="font-medium text-stone-900">创建任务</span>
          <p className="mt-1">登录后台 → 新建任务 → 填写「本次音频名称」（会写入 Excel 首列）。</p>
        </li>
        <li>
          <span className="font-medium text-stone-900">上传与处理</span>
          <p className="mt-1">上传多个 MP3 → 点击「开始处理」→ 等待状态变为「已完成」。</p>
        </li>
        <li>
          <span className="font-medium text-stone-900">下载结果</span>
          <p className="mt-1">在任务详情下载成品 MP3 与顺序表 xlsx；原始文件可定期从服务器清理。</p>
        </li>
      </ol>
      <p className="mt-10 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        提示：本站不提供在线播放与曲库检索，请勿将服务用作音乐平台。
      </p>
    </div>
  );
}
