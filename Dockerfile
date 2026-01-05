FROM oven/bun:1.3.3-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run generate
RUN bun build ./src/index.ts --target bun --outdir ./dist

FROM oven/bun:1.3.3-alpine AS release
WORKDIR /app

COPY --from=builder /app/dist/index.js ./index.js
COPY --from=builder /app/drizzle ./drizzle 

RUN mkdir -p /app/data
EXPOSE 3000

ENTRYPOINT ["bun", "index.js"]