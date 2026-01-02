import { OpenAPIHono } from "@hono/zod-openapi";
import { changePasswordHandler, loginHandler } from "./handlers";
import { changePasswordRoute, loginRoute } from "./routers";

const authRouter = new OpenAPIHono();

authRouter.openapi(loginRoute, loginHandler);
authRouter.openapi(changePasswordRoute, changePasswordHandler);

export default authRouter;
