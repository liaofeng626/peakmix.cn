import mysql from "mysql2/promise";
import { config } from "./config";

/**
 * MySQL 连接池（Express 多请求复用）
 */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});
