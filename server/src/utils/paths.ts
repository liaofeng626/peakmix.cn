import fs from "fs/promises";
import path from "path";
import { config } from "../config";

/**
 * 确保任务相关的目录存在：临时上传目录、输出目录
 */
export async function ensureTaskDirs(taskId: number) {
  const base = config.storageRoot;
  const tempDir = path.join(base, "temp", String(taskId));
  const outDir = path.join(base, "output", String(taskId));
  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(outDir, { recursive: true });
  return { tempDir, outDir };
}
