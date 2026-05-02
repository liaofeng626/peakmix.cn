# PeakMix

面向舞蹈活动场景的 **自有音频** 处理工具站：**不提供公共音乐库、不提供在线播放、不提供用户间分享**。用户上传 MP3 → 服务端随机打乱顺序 → `ffmpeg` 拼接 → 导出成品 MP3 与 `xlsx` 顺序表。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14（App Router）+ TypeScript + Tailwind CSS |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | MySQL 8 |
| 媒体 | ffmpeg |
| 表格 | xlsx |
| 认证 | JWT（`Authorization: Bearer`） |

## 目录结构

```
peakmix.cn/
├── web/                 # Next.js 前端（官网 + 用户后台）
├── server/              # Express API
├── sql/schema.sql       # MySQL 表结构
├── deploy/              # Nginx / PM2 示例配置
└── README.md
```

## 本地开发

### 1. 数据库

创建库并导入表结构：

```bash
mysql -u root -p < sql/schema.sql
```

复制 `server/.env.example` 为 `server/.env`，填写 MySQL 与 `JWT_SECRET`。

### 2. 依赖与环境

- 本机已安装 **Node.js 18+**、**MySQL**、**ffmpeg**（命令行可执行 `ffmpeg`）。

```bash
cd server && npm install && npm run dev
```

另开终端：

```bash
cd web
copy .env.local.example .env.local   # Windows；Linux/macOS: cp
npm install
npm run dev
```

前端默认 <http://localhost:3000>，API 默认 <http://127.0.0.1:4000>。  
`.env.local` 中 `NEXT_PUBLIC_API_URL` 需与 API 地址一致。

### 3. 流程验证

1. 访问 `/register` 注册 → 自动登录  
2. `/dashboard/tasks/new` 创建任务，填写「本次音频名称」  
3. 在任务详情上传多个 `.mp3` → 点击「随机排序并拼接」  
4. 完成后下载成品 MP3 与 Excel（表头：本次音频名称、顺序、文件名）

## 接口设计摘要（均需 JWT，除注册/登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册，body: `email`, `password`, `displayName?` |
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/auth/me` | 当前用户与会员摘要 |
| POST | `/api/v1/tasks` | 创建任务，body: `audioTitle` |
| GET | `/api/v1/tasks` | 任务列表 |
| GET | `/api/v1/tasks/:id` | 任务详情 + 文件列表 |
| POST | `/api/v1/tasks/:id/upload` | `multipart/form-data`，字段名 `files`，多文件 mp3 |
| POST | `/api/v1/tasks/:id/process` | 洗牌、ffmpeg 拼接、写 xlsx（内测：校验每日处理额度） |
| GET | `/api/v1/tasks/:id/download/mp3` | 下载成品音频 |
| GET | `/api/v1/tasks/:id/download/xlsx` | 下载顺序表 |
| GET | `/api/v1/billing/summary` | 会员与支付占位列表 |
| GET | `/api/v1/billing/overview` | 会员中心展示（含 `quota` 今日处理额度） |
| POST | `/api/v1/feedback` | 站内反馈，body: `type`, `content`, `contact?` |
| GET | `/api/v1/feedback` | 最近 100 条反馈列表（仅配置的管理员邮箱） |
| PATCH | `/api/v1/users/me` | body: `displayName` |

上传文件保存在 `server/data/temp/<taskId>/`，输出在 `server/data/output/<taskId>/`（可通过 `STORAGE_ROOT` 配置）。

## 生产部署（腾讯云轻量 + Linux + Nginx）

1. **构建**

   ```bash
   cd web && npm ci && npm run build
   cd ../server && npm ci && npm run build
   ```

2. **环境变量**  
   - `server/.env`：`JWT_SECRET`、`DB_*`、`STORAGE_ROOT`、`FFMPEG_PATH=/usr/bin/ffmpeg`  
   - 前端生产环境：`NEXT_PUBLIC_API_URL` 设为对外域名（与浏览器访问同源时可填 `https://你的域名`，由 Nginx 将 `/api` 转发到本机 4000）。

2b. **数据库增量（内测额度与反馈）**  
   若库已存在、未执行过内测脚本，在服务器上执行：

   ```bash
   mysql -u root -p peakmix < sql/feedback.sql
   ```

   （库名若不是 `peakmix`，请编辑 `sql/feedback.sql` 首行 `USE` 或改为在宝塔 SQL 窗口中分段执行。）

3. **Nginx**  
   参考 `deploy/nginx-peakmix.example.conf`：`location /api/` → API；`/` → Next。

4. **PM2**  
   参考 `deploy/ecosystem.config.cjs`，将 `cwd` 改为服务器上实际路径，执行：

   ```bash
   pm2 start deploy/ecosystem.config.cjs
   pm2 save
   ```

5. **安全**  
   使用强随机 `JWT_SECRET`；限制上传大小与频率；定期清理 `data/temp`；配置 HTTPS 证书。

## 数据库表

- `users` — 用户  
- `memberships` — 会员记录  
- `tasks` — 音频任务  
- `task_files` — 任务上传文件与随机后顺序  
- `payments` — 支付流水（预留）
- `feedbacks` — 站内反馈（内测）

详见 `sql/schema.sql`。已有环境请执行 `sql/feedback.sql` 中的增量语句（`processing_started_at` 字段与 `feedbacks` 表）。

## 许可与说明

第一版占位文案与界面仅供开发与演示；上线前请替换备案号、隐私政策与真实定价逻辑。
