import { Router } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";

const router = Router();

/** 与前端表单一致的反馈类型 */
const FEEDBACK_TYPES = new Set([
  "usage",
  "process_failed",
  "download",
  "feature_suggestion",
  "other",
]);

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
