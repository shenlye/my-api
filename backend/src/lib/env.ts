import { mkdir } from "node:fs/promises";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().default("/app/data/sqlite.db"),
    JWT_SECRET: z.string().default("your_jwt_secret_key"),
    DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("admin123456"),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("production"),
    PORT: z.coerce.number().int().positive().default(3000),
    ALLOWED_ORIGINS: z
        .string()
        .default(
            "https://blog.shenley.cn,http://localhost:5173,http://127.0.0.1:5173",
        ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("环境变量配置错误:", z.treeifyError(parsed.error));
    process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === "production") {
    if (env.DEFAULT_ADMIN_PASSWORD === "admin123456") {
        console.warn("\n" + "=".repeat(50));
        console.warn("SECURITY WARNING: Using default admin password.");
        console.warn("请务必在首次登录后通过个人设置修改密码！");
        console.warn("=".repeat(50) + "\n");
    }

    if (env.JWT_SECRET === "your_jwt_secret_key") {
        const secretPath = "/app/data/jwt_secret";
        try {
            await mkdir("/app/data", { recursive: true });
            const file = Bun.file(secretPath);
            let finalSecret = "";

            if (await file.exists()) {
                const content = (await file.text()).trim();
                if (content && content.length >= 32) {
                    finalSecret = content;
                    console.info(`从 ${secretPath} 加载了持久化 JWT_SECRET`);
                }
            }

            if (!finalSecret) {
                finalSecret = crypto.randomUUID();
                await Bun.write(secretPath, finalSecret);
                console.info(`🆕 已生成新的随机 JWT_SECRET 并保存至 ${secretPath}`);
            }

            env.JWT_SECRET = finalSecret;
        } catch (error) {
            console.error(`❌ 生产环境自动生成密钥失败 (${secretPath}):`, error);
            process.exit(1);
        }
    }
}

export { env };
