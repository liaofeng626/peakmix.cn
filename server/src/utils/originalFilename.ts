/**
 * multer 在部分环境下会把 UTF-8 文件名误当作 latin1，出现 æ、ç、µ 等「乱码」字节被展成单字的情形。
 * 仅在疑似 mojibake 时尝试 latin1 → utf8，且仅当转码后明显含中日韩字符时才采用，避免误伤纯英文文件名。
 */

const SUSPECT_MOJIBAKE =
  /[ÃÂÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿµ]/;

const HAS_CJK_OR_KANA_OR_HANGUL = /[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;

export function normalizeOriginalFilename(name: string): string {
  if (!name) return name;

  if (!SUSPECT_MOJIBAKE.test(name)) return name;

  try {
    const decoded = Buffer.from(name, "latin1").toString("utf8");

    if (!decoded || decoded.includes("\uFFFD")) return name;

    if (HAS_CJK_OR_KANA_OR_HANGUL.test(decoded)) return decoded;

    return name;
  } catch {
    return name;
  }
}
