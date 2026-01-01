import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema";

export const db = drizzle(process.env.DATABASE_URL!);

export const seedDefaultUser = async () => {
    try {
        const [result] = await db.select({ value: count() }).from(users);
        if (result.value === 0) {
            console.log("Creating default admin...");

            const rawPassword = process.env.DEFAULT_ADMIN_PASSWORD || crypto.randomUUID();
            const passwordHash = await Bun.password.hash(rawPassword);

            await db.insert(users).values({
                username: "admin",
                passwordHash: passwordHash,
            });

            console.log("-----------------------------------------");
            console.log("Default admin created");
            console.log("username: admin");
            console.log(`password: ${rawPassword}`);
            console.log("-----------------------------------------");
        }
    } catch (error) {
        console.error("Failed to seed default user:", error);
    }
}
