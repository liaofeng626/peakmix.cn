/**
 * 功能介绍页（占位文案）
 */
export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">功能</h1>
      <p className="mt-4 text-stone-600">
        PeakMix 为舞蹈排练与活动准备提供「自有音频」的随机排序与拼接能力。
      </p>
      <ul className="mt-10 space-y-6 text-sm text-stone-600">
        <li className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="font-medium text-stone-900">多文件上传</h2>
          <p className="mt-2">一次选择多段 MP3，写入临时目录并记录元数据。</p>
        </li>
        <li className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="font-medium text-stone-900">随机顺序</h2>
          <p className="mt-2">服务端洗牌算法打乱片段顺序，避免人工排版的重复劳动。</p>
        </li>
        <li className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="font-medium text-stone-900">ffmpeg 拼接</h2>
          <p className="mt-2">输出单一 MP3 成品，便于拷贝到播放器或现场设备。</p>
        </li>
        <li className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="font-medium text-stone-900">Excel 顺序表</h2>
          <p className="mt-2">表头：本次音频名称、顺序、文件名。便于归档与对账。</p>
        </li>
      </ul>
      <p className="mt-10 text-xs text-stone-500">
        明确不做：公共曲库、热门推荐、在线试听、用户间分享音频。
      </p>
    </div>
  );
}
