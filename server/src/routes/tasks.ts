import { Router } from "express";
import type { ResultSetHeader } from "mysql2";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db";
import { authRequired } from "../middleware/auth";
import type { AuthedRequest } from "../types";
import { ensureTaskDirs } from "../utils/paths";
import { processTaskFiles } from "../services/taskProcessor";
import type {
  TaskDetailRow,
  TaskFileRow,
  TaskFileStoredRow,
  TaskListRow,
  TaskOutputRow,
  TaskProcessRow,
  TaskStatusRow,
  TaskXlsxRow,
} from "../mysqlRows";

const router = Router();

/**
 * 仅允许 mp3，限制单次上传大小（可按需调整）
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, _file, cb) => {
      const taskId = Number((req.params as { id?: string }).id);
      if (!Number.isFinite(taskId)) {
        return cb(new Error("无效任务 ID"), "");
      }
      const { tempDir } = await ensureTaskDirs(taskId);
      cb(null, tempDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".mp3";
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 80 * 1024 * 1024, files: 50 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    if (!name.endsWith(".mp3")) {
      return cb(new Error("仅支持上传 .mp3 文件"));
    }
    cb(null, true);
  },
});

/**
 * 创建任务：填写「本次音频名称」
 */
router.post("/", authRequired, async (req: AuthedRequest, res) => {
  const audioTitle = String(req.body?.audioTitle || "").trim();
  if (!audioTitle) {
    return res.status(400).json({ message: "请填写本次音频名称" });
  }
  const uid = req.user!.id;
  const [r] = await pool.execute<ResultSetHeader>(
    `INSERT INTO tasks (user_id, audio_title, status) VALUES (:uid, :title, 'draft')`,
    { uid, title: audioTitle }
  );
  const insertId = Number(r.insertId);
  return res.status(201).json({ id: insertId, audioTitle, status: "draft" });
});

/**
 * 任务列表
 */
router.get("/", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const [rows] = await pool.query<TaskListRow[]>(
    `SELECT id, audio_title, status, created_at FROM tasks
     WHERE user_id = :uid
     ORDER BY id DESC`,
    { uid }
  );
  return res.json({ tasks: rows });
});

/**
 * 任务详情（含文件列表与输出路径信息）
 */
router.get("/:id", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const taskId = Number(req.params.id);
  if (!Number.isFinite(taskId)) return res.status(400).json({ message: "无效 ID" });

  const [tasks] = await pool.query<TaskDetailRow[]>(
    `SELECT id, audio_title, status, output_mp3_path, output_xlsx_path, error_message, created_at
     FROM tasks WHERE id = :tid AND user_id = :uid LIMIT 1`,
    { tid: taskId, uid }
  );
  const task = tasks[0];
  if (!task) return res.status(404).json({ message: "任务不存在" });

  const [files] = await pool.query<TaskFileRow[]>(
    `SELECT id, original_filename, sort_order, created_at FROM task_files
     WHERE task_id = :tid ORDER BY sort_order ASC, id ASC`,
    { tid: taskId }
  );

  return res.json({ task, files });
});

/**
 * 多文件上传：原始文件写入临时目录，并记录 task_files
 */
router.post("/:id/upload", authRequired, (req: AuthedRequest, res, next) => {
  upload.array("files", 50)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "上传失败" });
    }
    next();
  });
}, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const taskId = Number(req.params.id);
  if (!Number.isFinite(taskId)) return res.status(400).json({ message: "无效 ID" });

  const [tasks] = await pool.query<TaskStatusRow[]>(
    "SELECT id, status FROM tasks WHERE id = :tid AND user_id = :uid LIMIT 1",
    { tid: taskId, uid }
  );
  const task = tasks[0];
  if (!task) return res.status(404).json({ message: "任务不存在" });
  if (task.status === "processing") {
    return res.status(400).json({ message: "任务处理中，请稍后再上传" });
  }
  if (task.status === "done") {
    return res.status(400).json({ message: "任务已完成，请新建任务后再上传" });
  }

  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    return res.status(400).json({ message: "请选择至少一个 mp3 文件" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const f of files) {
      await conn.execute(
        `INSERT INTO task_files (task_id, original_filename, sort_order, stored_path)
         VALUES (:tid, :oname, 0, :spath)`,
        { tid: taskId, oname: f.originalname, spath: f.path }
      );
    }
    await conn.execute(
      `UPDATE tasks SET status = 'uploaded', error_message = NULL WHERE id = :tid`,
      { tid: taskId }
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ message: "保存上传记录失败" });
  } finally {
    conn.release();
  }

  return res.json({ message: "上传成功", count: files.length });
});

/**
 * 触发处理：随机打乱 → ffmpeg 拼接 → 生成 xlsx
 */
router.post("/:id/process", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const taskId = Number(req.params.id);
  if (!Number.isFinite(taskId)) return res.status(400).json({ message: "无效 ID" });

  const [tasks] = await pool.query<TaskProcessRow[]>(
    "SELECT id, audio_title, status FROM tasks WHERE id = :tid AND user_id = :uid LIMIT 1",
    {
      tid: taskId,
      uid,
    }
  );
  const task = tasks[0];
  if (!task) return res.status(404).json({ message: "任务不存在" });
  if (task.status === "processing") {
    return res.status(400).json({ message: "任务正在处理中" });
  }
  if (task.status === "done") {
    return res.status(400).json({ message: "任务已完成，无需重复处理" });
  }

  const [fileRows] = await pool.query<TaskFileStoredRow[]>(
    "SELECT id, original_filename, stored_path FROM task_files WHERE task_id = :tid",
    { tid: taskId }
  );
  if (!fileRows.length) {
    return res.status(400).json({ message: "请先上传音频文件" });
  }

  await pool.execute(
    `UPDATE tasks SET status = 'processing', error_message = NULL WHERE id = :tid`,
    { tid: taskId }
  );

  try {
    const result = await processTaskFiles({
      taskId,
      audioTitle: task.audio_title,
      rows: fileRows,
    });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const o of result.orders) {
        await conn.execute(
          "UPDATE task_files SET sort_order = :ord WHERE id = :id",
          { ord: o.order, id: o.id }
        );
      }
      await conn.execute(
        `UPDATE tasks SET status = 'done', output_mp3_path = :mp3, output_xlsx_path = :xlsx
         WHERE id = :tid`,
        { mp3: result.outputMp3, xlsx: result.outputXlsx, tid: taskId }
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    return res.json({ message: "处理完成", taskId });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "处理失败";
    await pool.execute(
      `UPDATE tasks SET status = 'failed', error_message = :msg WHERE id = :tid`,
      { msg, tid: taskId }
    );
    return res.status(500).json({ message: msg });
  }
});

/**
 * 下载最终 mp3
 */
router.get("/:id/download/mp3", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const taskId = Number(req.params.id);
  const [tasks] = await pool.query<TaskOutputRow[]>(
    "SELECT output_mp3_path, status FROM tasks WHERE id = :tid AND user_id = :uid LIMIT 1",
    { tid: taskId, uid }
  );
  const t = tasks[0];
  if (!t || t.status !== "done" || !t.output_mp3_path) {
    return res.status(404).json({ message: "暂无可下载的音频" });
  }
  try {
    await fs.access(t.output_mp3_path);
  } catch {
    return res.status(404).json({ message: "文件不存在或已被清理" });
  }
  const name = `peakmix-task-${taskId}.mp3`;
  return res.download(t.output_mp3_path, name);
});

/**
 * 下载顺序表 xlsx
 */
router.get("/:id/download/xlsx", authRequired, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const taskId = Number(req.params.id);
  const [tasks] = await pool.query<TaskXlsxRow[]>(
    "SELECT output_xlsx_path, status FROM tasks WHERE id = :tid AND user_id = :uid LIMIT 1",
    { tid: taskId, uid }
  );
  const t = tasks[0];
  if (!t || t.status !== "done" || !t.output_xlsx_path) {
    return res.status(404).json({ message: "暂无可下载的表格" });
  }
  try {
    await fs.access(t.output_xlsx_path);
  } catch {
    return res.status(404).json({ message: "文件不存在或已被清理" });
  }
  const name = `peakmix-order-${taskId}.xlsx`;
  return res.download(t.output_xlsx_path, name);
});

export default router;
