import { Router } from "express";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";
import type { UserPublicRow } from "../mysqlRows";

const router = Router();

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
  return res.json({ user: rows[0] });
});

export default router;
