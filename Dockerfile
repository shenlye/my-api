FROM oven/bun:latest AS base
WORKDIR /app


COPY package.json bun.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/


RUN bun install --frozen-lockfile

FROM base AS frontend-builder
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/index.html ./frontend/
COPY frontend/vite.config.ts ./frontend/ 
COPY frontend/tsconfig*.json ./frontend/

WORKDIR /app/frontend
RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN bun install --frozen-lockfile --production

COPY backend/src ./backend/src
COPY backend/drizzle.config.ts ./backend/
COPY backend/tsconfig*.json ./backend/

COPY --from=frontend-builder /app/frontend/dist ./backend/public

WORKDIR /app/backend
RUN mkdir -p /app/data
EXPOSE 3000

ENTRYPOINT ["sh", "-c", "bunx drizzle-kit push && bun run src/index.ts"]