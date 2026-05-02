import { Router } from "express";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";
import type { MembershipListRow, MembershipRow, PaymentRow } from "../mysqlRows";
import {
  countTasksProcessingStartedToday,
  resolveDailyProcessLimit,
} from "../services/dailyQuota";

const router = Router();

/**
 * 会员中心占位接口：返回当前会员与历史支付（第一版可空）
 */
router.get("/summary", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const [mems] = await pool.query<MembershipListRow[]>(
    `SELECT plan_code, status, started_at, ended_at FROM memberships
     WHERE user_id = :uid
     ORDER BY id DESC`,
    { uid }
  );

  const [payments] = await pool.query<PaymentRow[]>(
    `SELECT id, amount_cents, currency, status, created_at FROM payments
     WHERE user_id = :uid
     ORDER BY id DESC
     LIMIT 50`,
    { uid }
  );

  return res.json({
    memberships: mems,
    payments,
  });
});

/**
 * 会员中心首版：前端展示用的稳定结构（不接真实支付）
 *
 * - plan: free / pro（未来可扩展更多）
 * - status: active / expired / inactive
 * - expiresAt: 过期时间（ISO 字符串），无则 null
 * - orders: 订单列表（第一版可为空，用于占位展示）
 */
router.get("/overview", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;

  // 取最新一条会员记录（若没有会员记录，则默认 free + active）
  const [rows] = await pool.query<MembershipRow[]>(
    `SELECT plan_code, status, ended_at FROM memberships
     WHERE user_id = :uid
     ORDER BY id DESC
     LIMIT 1`,
    { uid }
  );

  const latest = rows[0] || null;

  const plan = (latest?.plan_code as "free" | "pro" | undefined) || "free";
  const status =
    (latest?.status as "active" | "expired" | "inactive" | undefined) || "active";
  const expiresAt = latest?.ended_at ? latest.ended_at.toISOString() : null;

  const [payments] = await pool.query<PaymentRow[]>(
    `SELECT id, amount_cents, currency, status, created_at FROM payments
     WHERE user_id = :uid
     ORDER BY id DESC
     LIMIT 50`,
    { uid }
  );

  // 订单结构尽量简单稳定，避免前端依赖数据库字段命名
  const orders = payments.map((p) => ({
    id: p.id,
    amountCents: p.amount_cents,
    currency: p.currency,
    status: p.status,
    createdAt: p.created_at.toISOString(),
  }));

  const { dailyLimit } = await resolveDailyProcessLimit(uid);
  const usedToday = await countTasksProcessingStartedToday(uid);
  const remainingToday = Math.max(0, dailyLimit - usedToday);

  return res.json({
    plan,
    status,
    expiresAt,
    quota: {
      usedToday,
      dailyLimit,
      remainingToday,
    },
    orders,
  });
});

export default router;
