import type { RouteHandler } from "@hono/zod-openapi";
import { eq, or } from "drizzle-orm";
import { sign } from "hono/jwt";
import { db } from "../../db";
import { users } from "../../db/schema";
import type { loginRoute } from "./routers";

export const loginHandler: RouteHandler<typeof loginRoute> = async (c) => {
    const { identifier, password } = c.req.valid("json");

    const user = await db
        .select()
        .from(users)
        .where(or(eq(users.username, identifier), eq(users.email, identifier)))
        .limit(1);

    if (user.length === 0) {
        return c.json({ message: "Invalid username/email or password" }, 401);
    }

    const isMatch = await Bun.password.verify(password, user[0].passwordHash);

    if (!isMatch) {
        return c.json({ message: "Invalid username/email or password" }, 401);
    }

    const payload = {
        sub: user[0].id,
        role: user[0].role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("ERROR: JWT_SECRET is not set.");
        return c.json({ message: "Internal server error" }, 500);
    }

    const token = await sign(payload, jwtSecret);

    return c.json({ token: token }, 200);
};
