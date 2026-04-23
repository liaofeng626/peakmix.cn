import type { Request } from "express";

/** JWT 解析后挂载到 req.user */
export type AuthUserPayload = {
  id: number;
  email: string;
};

export type AuthedRequest = Request & { user?: AuthUserPayload };

export type TaskStatus = "draft" | "uploaded" | "processing" | "done" | "failed";
