import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema";

export const db = drizzle(process.env.DATABASE_URL!);

export const seedDefaultUser = async () => {
    const [result] = await db.select({value: count()}).from(users)
    if(result.value === 0){
        console.log("Creating default admin...")

        const defaultPassword = "admin123"
        const passwordHash = await Bun.password.hash(defaultPassword)

        await db.insert(users).values({
            username: "admin",
            passwordHash: passwordHash,
        })

        console.log("-----------------------------------------");
        console.log("Default admin created")
        console.log("username: admin")
        console.log(`password: ${defaultPassword}`)
        console.log("-----------------------------------------");
    }
}
