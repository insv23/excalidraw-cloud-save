import type { Drawing, AccessResult } from "./drawing";

declare module "hono" {
  interface ContextVariableMap {
    user: { id: string };
    drawing: Drawing;
    access: AccessResult;
  }
}