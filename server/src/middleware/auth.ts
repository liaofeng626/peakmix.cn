import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AuthedRequest, AuthUserPayload } from "../types";

/**
 * 从 Authorization: Bearer <token> 解析 JWT，并写入 req.user
 */
export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "未登录或缺少 Token" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthUserPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Token 无效或已过期" });
  }
}
