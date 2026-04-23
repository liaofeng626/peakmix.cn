import { Router } from "express";
import type { ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { pool } from "../db";
import { config } from "../config";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";
import type { IdRow, MembershipRow, UserLoginRow, UserPublicRow } from "../mysqlRows";

const router = Router();

/**
 * 用户注册：写入 users + 默认 free 会员
 */
router.post("/register", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const displayName = req.body?.displayName ? String(req.body.displayName).trim() : null;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ message: "邮箱与密码无效（密码至少 8 位）" });
  }

  const conn = await pool.getConnection();
  try {
    const [exists] = await conn.query<IdRow[]>(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      { email }
    );
    if (exists.length) {
      return res.status(409).json({ message: "该邮箱已注册" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await conn.beginTransaction();
    const [r] = await conn.execute<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, display_name) VALUES (:email, :hash, :dn)`,
      { email, hash: passwordHash, dn: displayName }
    );
    const userId = Number(r.insertId);

    await conn.execute(
      `INSERT INTO memberships (user_id, plan_code, status) VALUES (:uid, 'free', 'active')`,
      { uid: userId }
    );
    await conn.commit();

    // expiresIn 在 @types/jsonwebtoken 中与 ms 包类型联动，这里显式断言避免 string 字面量报错
    const signOpts: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
    };
    const token = jwt.sign({ id: userId, email }, config.jwtSecret as Secret, signOpts);

    return res.status(201).json({
      token,
      user: { id: userId, email, displayName },
    });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ message: "注册失败，请稍后重试" });
  } finally {
    conn.release();
  }
});

/**
 * 登录：校验密码并签发 JWT
 */
router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) {
    return res.status(400).json({ message: "请输入邮箱和密码" });
  }

  const [rows] = await pool.query<UserLoginRow[]>(
    "SELECT id, email, password_hash, display_name FROM users WHERE email = :email LIMIT 1",
    { email }
  );
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ message: "账号或密码错误" });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "账号或密码错误" });
  }

  const signOpts: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret as Secret, signOpts);

  return res.json({
    token,
    user: { id: user.id, email: user.email, displayName: user.display_name },
  });
});

/**
 * 当前用户信息与会员状态
 */
router.get("/me", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const [users] = await pool.query<UserPublicRow[]>(
    "SELECT id, email, display_name FROM users WHERE id = :id LIMIT 1",
    { id: uid }
  );
  const u = users[0];
  if (!u) return res.status(404).json({ message: "用户不存在" });

  const [mems] = await pool.query<MembershipRow[]>(
    `SELECT plan_code, status, ended_at FROM memberships
     WHERE user_id = :uid
     ORDER BY id DESC
     LIMIT 1`,
    { uid }
  );
  const m = mems[0] || { plan_code: "free", status: "active", ended_at: null };

  return res.json({
    user: { id: u.id, email: u.email, displayName: u.display_name },
    membership: m,
  });
});

export default router;
