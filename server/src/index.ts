import express from "express";
import cors from "cors";
import fs from "fs/promises";
import { config } from "./config";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import billingRoutes from "./routes/billing";
import userRoutes from "./routes/users";
import feedbackRoutes from "./routes/feedback";

/**
 * PeakMix API 入口
 * 线上通过 Nginx 代理：
 *   /api/      -> 127.0.0.1:4000
 * 实际业务路由：
 *   /api/v1/*
 */
async function bootstrap() {
  await fs.mkdir(config.storageRoot, { recursive: true });

  const app = express();

  // CORS：你现在已经同域（peakmix.cn + /api），这里放宽一点也没问题
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // JSON 请求体
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 根路由，方便你直接访问 http://peakmix.cn/api/
  app.get("/", (_req, res) => {
    res.send("PeakMix API Running");
  });

  // 健康检查
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "peakmix-api" });
  });

  // 业务路由
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/tasks", taskRoutes);
  app.use("/api/v1/billing", billingRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/feedback", feedbackRoutes);

  // 404 统一返回 JSON，别返回 HTML
  app.use((_req, res) => {
    res.status(404).json({ message: "接口不存在" });
  });

  // 错误处理中间件
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("API Error:", err);
      res.status(500).json({
        message: err.message || "服务器内部错误",
      });
    }
  );

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`PeakMix API 已启动：http://127.0.0.1:${config.port}`);
  });
}

bootstrap().catch((e) => {
  console.error("启动失败", e);
  process.exit(1);
});