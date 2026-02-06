/* eslint-disable */
// @ts-nocheck
import type { D1Database, D1Migration } from "@cloudflare/workers-types";

declare global {
  interface Body {
      json(): Promise<any>;
  }
  interface Response {
      json(): Promise<any>;
  }
}

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[];
  }
}
