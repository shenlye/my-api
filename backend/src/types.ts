import type { AuthService } from "./services/auth";
import type { CategoryService } from "./services/categories";
import type { PostService } from "./services/posts";
import type { TagService } from "./services/tags";

export type Env = Cloudflare.Env & {
  JWT_SECRET: string;
};

declare module "hono" {
  interface ContextVariableMap {
    postService: PostService;
    categoryService: CategoryService;
    tagService: TagService;
    authService: AuthService;
    jwtPayload: {
      sub: number;
      role: "admin" | "user";
      exp: number;
    };
  }
}
