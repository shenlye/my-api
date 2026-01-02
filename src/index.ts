import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { logger as honoLogger } from "hono/logger";
import { seedDefaultUser } from "./db";
import { logger } from "./lib/logger";
import authRouter from "./routes/auth/index";
import postsRouter from "./routes/posts/index";

const app = new OpenAPIHono();

app.use(
    "*",
    honoLogger((str) => logger.info(str)),
);

await seedDefaultUser();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
});

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "My API",
    },
});

app.get("/scalar", Scalar({ url: "/doc" }));

app.route("/posts", postsRouter);
app.route("/auth", authRouter);

export default app;
