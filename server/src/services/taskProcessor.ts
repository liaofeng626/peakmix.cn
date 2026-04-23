import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { config } from "../config";
import { ensureTaskDirs } from "../utils/paths";

export type FileRow = {
  id: number;
  original_filename: string;
  stored_path: string;
};

/**
 * Fisher–Yates 洗牌算法：原地打乱数组
 */
function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 调用 ffmpeg 的 concat demuxer 将多个 mp3 按顺序拼接
 * 使用重新编码，避免不同采样率导致 -c copy 失败
 */
function runFfmpegConcat(listFile: string, outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",
      outputFile,
    ];
    const child = spawn(config.ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg 退出码 ${code}: ${stderr.slice(-800)}`));
    });
  });
}

/**
 * 生成 ffmpeg concat 列表文件内容（每行 file 'path'）
 * Windows 路径中的单引号需要转义为 '\\''
 */
function concatListLine(absPath: string) {
  const normalized = absPath.replace(/\\/g, "/");
  const escaped = normalized.replace(/'/g, "'\\''");
  return `file '${escaped}'`;
}

/**
 * 核心业务：打乱顺序 → 写 concat 列表 → ffmpeg 输出 mp3 → xlsx 顺序表
 */
export async function processTaskFiles(params: {
  taskId: number;
  audioTitle: string;
  rows: FileRow[];
}) {
  const { taskId, audioTitle, rows } = params;
  if (!rows.length) {
    throw new Error("没有可处理的文件");
  }

  const shuffled = [...rows];
  shuffleInPlace(shuffled);

  const { outDir } = await ensureTaskDirs(taskId);
  const listPath = path.join(outDir, "concat-list.txt");
  const outputMp3 = path.join(outDir, "final.mp3");
  const outputXlsx = path.join(outDir, "order.xlsx");

  const lines = shuffled.map((r) => concatListLine(path.resolve(r.stored_path)));
  await fs.writeFile(listPath, lines.join("\n"), "utf8");

  await runFfmpegConcat(listPath, outputMp3);

  // Excel：表头 — 本次音频名称、顺序、文件名
  const sheetData: (string | number)[][] = [
    ["本次音频名称", "顺序", "文件名"],
    ...shuffled.map((r, idx) => [audioTitle, idx + 1, r.original_filename]),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "顺序表");
  XLSX.writeFile(wb, outputXlsx);

  // 返回更新 sort_order 用的映射：file id -> order
  const orders: { id: number; order: number }[] = shuffled.map((r, idx) => ({
    id: r.id,
    order: idx + 1,
  }));

  return {
    outputMp3,
    outputXlsx,
    orders,
  };
}
