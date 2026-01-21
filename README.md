# My Simple Blog Admin

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/shenlye/my-api)

基于 Bun + Hono + React 19 的全栈博客管理系统。

## 技术栈

### 后端 (Backend)
- **Runtime**: Bun
- **Framework**: Hono + Zod OpenAPI
- **ORM**: Drizzle ORM (SQLite)
- **Auth**: JWT
- **Linter**: ESLint (@antfu/config)

### 前端 (Frontend)
- **Framework**: React 19 + Vite
- **UI Components**: Shadcn UI + Tailwind CSS 4
- **Editor**: Milkdown Crepe
- **Data Fetching**: TanStack Query v5
- **Routing**: React Router 7

## 快速开始

### 1. 安装依赖
```bash
bun install
```

### 2. 初始化数据库
```bash
bunx drizzle-kit push
```

### 3. 启动开发环境
```bash
bun run dev
```
后端默认运行在 `http://localhost:3000`，前端运行在 `http://localhost:5173`。

## Docker 部署

### Docker Run 运行

```bash
docker run -d \
  --name blog-admin \
  -p 8088:3000 \
  -v /opt/blog-backend/data:/app/data \
  --restart always \
  ghcr.io/shenlye/my-api:latest
```

### Docker Compose 运行

```bash
docker-compose up -d
```

`docker-compose.yml` 配置示例：

```yaml
services:
  blog-admin:
    image: ghcr.io/shenlye/my-api:latest
    container_name: blog-admin
    ports:
      - "8088:3000"
    volumes:
      - ./data:/app/data
    environment:
      JWT_SECRET: your_secret
      DEFAULT_ADMIN_PASSWORD: admin123456
      ALLOWED_ORIGINS: http://your-domain.com
    restart: always
```

## 环境变量
- `DATABASE_URL`: SQLite 路径，默认 `/app/data/sqlite.db`
- `JWT_SECRET`: JWT 密钥
- `DEFAULT_ADMIN_PASSWORD`: 初始管理员密码 (账号: admin)
- `ALLOWED_ORIGINS`: 允许的跨域域名
