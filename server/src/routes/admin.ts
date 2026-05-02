import { Router } from "express";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type {
  AdminCountRow,
  AdminRecentTaskRow,
  AdminRecentUserRow,
  FeedbackAdminListRow,
  UserEmailOnlyRow,
} from "../mysqlRows";
import type { AuthedRequest } from "../types";

const router = Router();

const ADMIN_EMAIL = "liaofeng1451027498@gmail.com";

async function countOne(sql: string): Promise<number> {
  const [rows] = await pool.query<AdminCountRow[]>(sql);
  return Number(rows[0]?.cnt ?? 0);
}

/**
 * 管理员：内测数据总览（统计 + 最近用户 / 任务 / 反馈）
 */
router.get("/overview", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const [users] = await pool.query<UserEmailOnlyRow[]>(
    "SELECT email FROM users WHERE id = :uid LIMIT 1",
    { uid }
  );
  const email = (users[0]?.email || "").trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: "无权查看管理员数据" });
  }

  try {
    const [
      totalUsers,
      todayUsers,
      totalTasks,
      todayTasks,
      todayProcessedTasks,
      totalFeedbacks,
      todayFeedbacks,
    ] = await Promise.all([
      countOne("SELECT COUNT(*) AS cnt FROM users"),
      countOne("SELECT COUNT(*) AS cnt FROM users WHERE DATE(created_at) = CURDATE()"),
      countOne("SELECT COUNT(*) AS cnt FROM tasks"),
      countOne("SELECT COUNT(*) AS cnt FROM tasks WHERE DATE(created_at) = CURDATE()"),
      countOne(
        `SELECT COUNT(*) AS cnt FROM tasks
         WHERE processing_started_at IS NOT NULL
           AND DATE(processing_started_at) = CURDATE()`
      ),
      countOne("SELECT COUNT(*) AS cnt FROM feedbacks"),
      countOne("SELECT COUNT(*) AS cnt FROM feedbacks WHERE DATE(created_at) = CURDATE()"),
    ]);

    const [recentUserRows] = await pool.query<AdminRecentUserRow[]>(
      `SELECT id, email, display_name, created_at FROM users ORDER BY id DESC LIMIT 10`
    );

    const [recentTaskRows] = await pool.query<AdminRecentTaskRow[]>(
      `SELECT t.id, t.user_id, u.email, t.audio_title, t.status, t.processing_started_at, t.created_at
       FROM tasks t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.id DESC
       LIMIT 20`
    );

    const [recentFbRows] = await pool.query<FeedbackAdminListRow[]>(
      `SELECT f.id, f.user_id, u.email, f.type, f.content, f.contact, f.created_at
       FROM feedbacks f
       JOIN users u ON u.id = f.user_id
       ORDER BY f.id DESC
       LIMIT 20`
    );

    return res.json({
      stats: {
        totalUsers,
        todayUsers,
        totalTasks,
        todayTasks,
        todayProcessedTasks,
        totalFeedbacks,
        todayFeedbacks,
      },
      recentUsers: recentUserRows.map((r) => ({
        id: r.id,
        email: r.email,
        displayName: r.display_name,
        createdAt: r.created_at.toISOString(),
      })),
      recentTasks: recentTaskRows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        email: r.email,
        audioTitle: r.audio_title,
        status: r.status,
        processingStartedAt: r.processing_started_at
          ? r.processing_started_at.toISOString()
          : null,
        createdAt: r.created_at.toISOString(),
      })),
      recentFeedbacks: recentFbRows.map((f) => ({
        id: f.id,
        userId: f.user_id,
        email: f.email,
        type: f.type,
        content: f.content,
        contact: f.contact ?? "",
        createdAt: f.created_at.toISOString(),
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "加载管理员数据失败" });
  }
});

export default router;
