-- PeakMix 数据库结构（MySQL 8+）
-- 说明：字符集使用 utf8mb4，便于存储中文文件名与文案

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS peakmix
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE peakmix;

-- ----------------------------
-- 1. 用户表 users
-- ----------------------------
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS task_files;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL COMMENT '登录邮箱，唯一',
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 哈希后的密码',
  display_name VARCHAR(100) DEFAULT NULL COMMENT '展示昵称',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账号';

-- ----------------------------
-- 2. 会员表 memberships（与 users 一对多，当前有效会员取最新一条即可）
-- ----------------------------
CREATE TABLE memberships (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL COMMENT '关联用户',
  plan_code VARCHAR(32) NOT NULL DEFAULT 'free' COMMENT '套餐代码：free / pro 等',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '状态：active / expired / canceled',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生效时间',
  ended_at DATETIME DEFAULT NULL COMMENT '到期时间，NULL 表示长期或待定',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_memberships_user (user_id),
  CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员订阅记录';

-- ----------------------------
-- 3. 音频任务表 tasks
-- ----------------------------
CREATE TABLE tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  audio_title VARCHAR(255) NOT NULL COMMENT '本次音频名称（业务展示名）',
  status ENUM('draft','uploaded','processing','done','failed') NOT NULL DEFAULT 'draft' COMMENT '任务状态',
  processing_started_at DATETIME DEFAULT NULL COMMENT '首次进入处理流程时间（每日额度按服务器本地日期统计）',
  output_mp3_path VARCHAR(512) DEFAULT NULL COMMENT '拼接后 mp3 相对/绝对路径（由服务端约定）',
  output_xlsx_path VARCHAR(512) DEFAULT NULL COMMENT '顺序表 xlsx 路径',
  error_message TEXT COMMENT '失败原因',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasks_user (user_id),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音频拼接任务';

-- ----------------------------
-- 4. 任务文件表 task_files（上传的原始 mp3，处理前存临时目录）
-- ----------------------------
CREATE TABLE task_files (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id BIGINT UNSIGNED NOT NULL,
  original_filename VARCHAR(512) NOT NULL COMMENT '用户原始文件名',
  sort_order INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '随机打乱后的顺序号，从 1 开始；0 表示尚未处理',
  stored_path VARCHAR(512) NOT NULL COMMENT '服务器磁盘上的临时路径',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_task_files_task (task_id),
  CONSTRAINT fk_task_files_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务关联的上传文件';

-- ----------------------------
-- 5. 站内反馈表 feedbacks（内测）
-- ----------------------------
CREATE TABLE feedbacks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(32) NOT NULL COMMENT 'usage / process_failed / download / feature_suggestion / other',
  content TEXT NOT NULL COMMENT '问题描述',
  contact VARCHAR(255) DEFAULT NULL COMMENT '选填联系方式',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feedbacks_user (user_id),
  CONSTRAINT fk_feedbacks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户反馈';

-- ----------------------------
-- 6. 支付记录表 payments（预留，第一版可仅占位）
-- ----------------------------
CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  amount_cents INT NOT NULL COMMENT '金额（分）',
  currency CHAR(3) NOT NULL DEFAULT 'CNY' COMMENT '货币代码',
  provider VARCHAR(64) NOT NULL DEFAULT 'manual' COMMENT '支付渠道：wechat / alipay / manual 等',
  external_id VARCHAR(191) DEFAULT NULL COMMENT '第三方订单号',
  status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending / paid / failed / refunded',
  meta JSON DEFAULT NULL COMMENT '扩展字段（原始回调等）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_user (user_id),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付流水';

SET FOREIGN_KEY_CHECKS = 1;
