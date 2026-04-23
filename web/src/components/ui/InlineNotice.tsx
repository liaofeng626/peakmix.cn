import type { HTMLAttributes } from "react";

type Tone = "info" | "warn" | "danger" | "success";

const toneMap: Record<Tone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

/**
 * 内联提示：用于说明合规边界、上传限制、错误提示等
 */
export function InlineNotice({
  tone = "info",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      {...props}
      className={`rounded-xl border px-4 py-3 text-sm ${toneMap[tone]} ${className}`}
    />
  );
}

