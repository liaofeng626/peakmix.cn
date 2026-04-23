import path from "path";
import dotenv from "dotenv";

// 加载 .env（本地开发）
dotenv.config();

/**
 * 集中读取环境变量，避免在业务代码里散落 process.env
 */
export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev_only_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "peakmix",
  },
  /** 本地文件存储根目录（绝对路径） */
  storageRoot: path.resolve(process.env.STORAGE_ROOT || path.join(process.cwd(), "data")),
  ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
};
