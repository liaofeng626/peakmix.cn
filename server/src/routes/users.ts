import { Router } from "express";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";
import type { UserMeRow, UserPublicRow } from "../mysqlRows";

const router = Router();

/**
 * 当前账号信息（账号设置页使用）
 * 第一版：只返回基础信息，便于前端展示与后续扩展
 */
router.get("/me", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const [rows] = await pool.query<UserMeRow[]>(
    "SELECT id, email, display_name, created_at FROM users WHERE id = :id LIMIT 1",
    { id: uid }
  );
  const u = rows[0];
  if (!u) return res.status(404).json({ message: "用户不存在" });

  return res.json({
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    createdAt: u.created_at.toISOString(),
  });
});

/**
 * 更新账号展示信息（昵称）
 */
router.patch("/me", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const displayName = req.body?.displayName != null ? String(req.body.displayName).trim() : null;
  if (displayName === "") {
    return res.status(400).json({ message: "昵称不能为空字符串" });
  }
  await pool.execute("UPDATE users SET display_name = :dn WHERE id = :id", {
    dn: displayName,
    id: uid,
  });
  const [rows] = await pool.query<UserPublicRow[]>(
    "SELECT id, email, display_name FROM users WHERE id = :id LIMIT 1",
    { id: uid }
  );
  const u = rows[0];
  if (!u) return res.status(404).json({ message: "用户不存在" });

  // 兼容旧返回结构（如果前端/其他地方仍在用 user 字段）
  // 同时提供 settings 页更偏“直接可展示”的顶层字段
  return res.json({
    user: u,
    id: u.id,
    email: u.email,
    displayName: u.display_name,
  });
});

export default router;
