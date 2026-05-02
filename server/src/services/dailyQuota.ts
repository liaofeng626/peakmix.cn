import type { RowDataPacket } from "mysql2";
import { pool } from "../db";
import type { MembershipRow } from "../mysqlRows";

type CountRow = RowDataPacket & { c: number };

/** 内测：免费用户每日可「开始处理」的任务数（不同任务各算一次，同任务失败可重试不额外占用） */
export const FREE_DAILY_PROCESS_LIMIT = 1;
/** Pro 占位：active 时每日次数上限 */
export const PRO_DAILY_PROCESS_LIMIT = 10;

export type BillingPlan = "free" | "pro";

/**
 * 根据最新一条 memberships 记录解析当日处理上限
 * - pro + active → PRO 占位额度
 * - 其余 → 免费额度
 */
export async function resolveDailyProcessLimit(
  userId: number
): Promise<{ plan: BillingPlan; dailyLimit: number }> {
  const [rows] = await pool.query<MembershipRow[]>(
    `SELECT plan_code, status FROM memberships
     WHERE user_id = :uid
     ORDER BY id DESC
     LIMIT 1`,
    { uid: userId }
  );
  const latest = rows[0];
  const planCode = (latest?.plan_code || "free").toLowerCase();
  const status = (latest?.status || "active").toLowerCase();

  if (planCode === "pro" && status === "active") {
    return { plan: "pro", dailyLimit: PRO_DAILY_PROCESS_LIMIT };
  }
  return { plan: "free", dailyLimit: FREE_DAILY_PROCESS_LIMIT };
}

/**
 * 今日已成功「首次进入处理」的任务数（有 processing_started_at 且日期为当天）
 */
export async function countTasksProcessingStartedToday(userId: number): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS c FROM tasks
     WHERE user_id = :uid
       AND processing_started_at IS NOT NULL
       AND DATE(processing_started_at) = CURDATE()`,
    { uid: userId }
  );
  return Number(rows[0]?.c ?? 0);
}

/**
 * 除指定任务外，今日已有首次进入处理的其他任务数量（用于判断是否还能开新任务的处理）
 */
export async function countOtherTasksProcessingStartedToday(
  userId: number,
  excludeTaskId: number
): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS c FROM tasks
     WHERE user_id = :uid
       AND id <> :tid
       AND processing_started_at IS NOT NULL
       AND DATE(processing_started_at) = CURDATE()`,
    { uid: userId, tid: excludeTaskId }
  );
  return Number(rows[0]?.c ?? 0);
}
