import { Router } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { FeedbackAdminListRow, UserEmailOnlyRow } from "../mysqlRows";
import type { AuthedRequest } from "../types";

const router = Router();

/** 第一版：硬编码管理员邮箱（仅该账号可拉取反馈列表） */
const ADMIN_FEEDBACK_EMAIL = "liaofeng1451027498@gmail.com";

/** 与前端表单一致的反馈类型 */
const FEEDBACK_TYPES = new Set([
  "usage",
  "process_failed",
  "download",
  "feature_suggestion",
  "other",
]);

/**
 * 管理员：最近 100 条反馈（需登录且邮箱匹配）
 */
router.get("/", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const [users] = await pool.query<UserEmailOnlyRow[]>(
    "SELECT email FROM users WHERE id = :uid LIMIT 1",
    { uid }
  );
  const email = (users[0]?.email || "").trim().toLowerCase();
  if (email !== ADMIN_FEEDBACK_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: "无权查看反馈列表" });
  }

  const [rows] = await pool.query<FeedbackAdminListRow[]>(
    `SELECT f.id, f.user_id, u.email, f.type, f.content, f.contact, f.created_at
     FROM feedbacks f
     JOIN users u ON u.id = f.user_id
     ORDER BY f.id DESC
     LIMIT 100`
  );

  return res.json({
    feedbacks: rows.map((f) => ({
      id: f.id,
      userId: f.user_id,
      email: f.email,
      type: f.type,
      content: f.content,
      contact: f.contact ?? "",
      createdAt: f.created_at.toISOString(),
    })),
  });
});

/**
 * 内测：站内反馈（最小可用）
 */
router.post("/", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const type = String(req.body?.type || "").trim();
  const content = String(req.body?.content || "").trim();
  const contact = String(req.body?.contact || "").trim() || null;

  if (!content) {
    return res.status(400).json({ message: "请填写问题描述" });
  }
  if (!FEEDBACK_TYPES.has(type)) {
    return res.status(400).json({ message: "请选择有效的反馈类型" });
  }

  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO feedbacks (user_id, type, content, contact) VALUES (:uid, :type, :content, :contact)`,
      { uid, type, content, contact }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "保存反馈失败，请稍后重试" });
  }

  return res.status(201).json({ message: "反馈已收到" });
});

export default router;
