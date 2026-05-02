import type { RowDataPacket } from "mysql2";

/**
 * 以下为 SELECT 查询结果行类型（均需 extends RowDataPacket 以满足 mysql2 泛型约束）
 */

export type IdRow = RowDataPacket & { id: number };

export type UserLoginRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
};

export type UserPublicRow = RowDataPacket & {
  id: number;
  email: string;
  display_name: string | null;
};

export type UserMeRow = RowDataPacket & {
  id: number;
  email: string;
  display_name: string | null;
  created_at: Date;
};

export type MembershipRow = RowDataPacket & {
  plan_code: string;
  status: string;
  ended_at: Date | null;
};

export type MembershipListRow = RowDataPacket & {
  plan_code: string;
  status: string;
  started_at: Date;
  ended_at: Date | null;
};

export type PaymentRow = RowDataPacket & {
  id: number;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: Date;
};

/** 管理员反馈列表 JOIN users */
export type FeedbackAdminListRow = RowDataPacket & {
  id: number;
  user_id: number;
  email: string;
  type: string;
  content: string;
  contact: string | null;
  created_at: Date;
};

export type UserEmailOnlyRow = RowDataPacket & { email: string };

export type TaskListRow = RowDataPacket & {
  id: number;
  audio_title: string;
  status: string;
  created_at: Date;
};

export type TaskDetailRow = RowDataPacket & {
  id: number;
  audio_title: string;
  status: string;
  output_mp3_path: string | null;
  output_xlsx_path: string | null;
  error_message: string | null;
  created_at: Date;
};

export type TaskFileRow = RowDataPacket & {
  id: number;
  original_filename: string;
  sort_order: number;
  created_at: Date;
};

export type TaskStatusRow = RowDataPacket & { id: number; status: string };

export type TaskProcessRow = RowDataPacket & {
  id: number;
  audio_title: string;
  status: string;
  processing_started_at: Date | null;
};

export type TaskFileStoredRow = RowDataPacket & {
  id: number;
  original_filename: string;
  stored_path: string;
};

export type TaskOutputRow = RowDataPacket & {
  output_mp3_path: string | null;
  status: string;
};

export type TaskXlsxRow = RowDataPacket & {
  output_xlsx_path: string | null;
  status: string;
};
