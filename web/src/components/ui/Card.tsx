import type { HTMLAttributes } from "react";

/**
 * 统一卡片容器：后台页面主要信息承载
 */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`p-6 ${className}`} />;
}

export function CardBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`px-6 pb-6 ${className}`} />;
}

