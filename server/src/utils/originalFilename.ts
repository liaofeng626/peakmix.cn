/**
 * multer 在部分环境下会把 UTF-8 文件名误当作 latin1，出现 Ã、å、ã 等「乱码」。
 * 仅在疑似 mojibake 时尝试 latin1 → utf8，避免误伤纯英文文件名。
 */
/** 常见于 UTF-8 被误作 latin1 时的替换字符（含用户反馈的 å、ã 等） */
const SUSPECT_MOJIBAKE = /[\u00C3\u00C2\u00E3\u00E5\u00E4\u00ED\u00EC\u00F0]/;

export function normalizeOriginalFilename(name: string): string {
  const raw = String(name || "");
  if (!raw || !SUSPECT_MOJIBAKE.test(raw)) return raw;
  try {
    const decoded = Buffer.from(raw, "latin1").toString("utf8");
    if (!decoded || decoded === raw) return raw;
    if (decoded.includes("\uFFFD")) return raw;
    return decoded;
  } catch {
    return raw;
  }
}
