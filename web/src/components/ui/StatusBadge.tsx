/**
 * 任务状态徽章：把后端的 status 显示成用户能看懂的语义
 */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string; hint?: string }
  > = {
    // 会员状态（用于会员中心）
    active: {
      label: "有效",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      hint: "当前套餐可正常使用",
    },
    expired: {
      label: "已过期",
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      hint: "套餐已到期，可升级续费（第一版为占位）",
    },
    inactive: {
      label: "未开通",
      cls: "bg-stone-100 text-stone-700 ring-stone-200",
      hint: "当前为免费使用状态",
    },

    draft: {
      label: "未上传",
      cls: "bg-stone-100 text-stone-700 ring-stone-200",
      hint: "请先上传 MP3 文件",
    },
    uploaded: {
      label: "待处理",
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      hint: "可开始随机排序并拼接",
    },
    processing: {
      label: "处理中",
      cls: "bg-sky-50 text-sky-700 ring-sky-200",
      hint: "请勿关闭页面，稍后可刷新查看",
    },
    done: {
      label: "已完成",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      hint: "可下载成品 MP3 与 Excel 顺序表",
    },
    failed: {
      label: "失败",
      cls: "bg-red-50 text-red-700 ring-red-200",
      hint: "可查看错误信息后重试",
    },
  };

  const x = map[status] || {
    label: status,
    cls: "bg-stone-100 text-stone-700 ring-stone-200",
  };

  return (
    <span
      title={x.hint}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${x.cls}`}
    >
      {x.label}
    </span>
  );
}

