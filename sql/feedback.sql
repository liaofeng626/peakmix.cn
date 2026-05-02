-- PeakMix 内测：已有数据库上执行（宝塔 / mysql 客户端）
-- 1) 任务表增加「首次开始处理」时间，用于每日额度
-- 2) 新建反馈表

USE peakmix;

ALTER TABLE tasks
  ADD COLUMN processing_started_at DATETIME DEFAULT NULL
    COMMENT '首次进入处理流程时间（每日额度按服务器本地日期统计）'
    AFTER status;

CREATE TABLE IF NOT EXISTS feedbacks (
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
