import { z } from "zod";
import { logger } from "./logger";

const envSchema = z.object({
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET 必须至少 16 位以保证安全"),
    DEFAULT_ADMIN_PASSWORD: z.string().min(8),
    BUN_ENV: z
        .enum(["development", "production"])
        .default("production"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    logger.error(z.treeifyError(parsed.error), "环境变量配置错误:");
    process.exit(1);
}

export const env = parsed.data;

if (env.JWT_SECRET === "your_jwt_secret_key" && env.BUN_ENV === "production") {
    logger.error(
        "你正在使用默认的 JWT_SECRET，这在生产环境中是不安全的！请更改它以确保应用程序的安全。",
    );
    process.exit(1);
}
