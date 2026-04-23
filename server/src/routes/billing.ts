import { Router } from "express";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";
import type { MembershipListRow, PaymentRow } from "../mysqlRows";

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

export default router;
