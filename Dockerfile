# 使用官方 Bun 镜像
FROM oven/bun:latest AS base
WORKDIR /app

# --- 依赖阶段 ---
FROM base AS install
COPY package.json bun.lock ./
RUN bun install

# --- 运行阶段 ---
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data

# 暴露 Hono 默认端口
EXPOSE 3000

ENTRYPOINT ["sh", "-c", "bunx drizzle-kit push && bun run src/index.ts"]