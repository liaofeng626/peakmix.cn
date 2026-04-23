/**
 * PM2 进程表示例：同时守护 Next.js 与 Express API
 *
 * 使用前：
 * 1. 在服务器上 `cd web && npm run build`
 * 2. 在服务器上 `cd server && npm run build`
 * 3. 配置好 .env 与 MySQL、ffmpeg
 * 4. `pm2 start deploy/ecosystem.config.cjs`
 */
module.exports = {
  apps: [
    {
      name: "peakmix-web",
      cwd: "/var/www/peakmix/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // 与前端构建时注入一致：浏览器请求同域 /api → Nginx 反代到 API
        NEXT_PUBLIC_API_URL: "https://your-domain.com",
      },
    },
    {
      name: "peakmix-api",
      cwd: "/var/www/peakmix/server",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      // 也可使用 env_file 指向 server/.env（需 PM2 版本支持）
    },
  ],
};
