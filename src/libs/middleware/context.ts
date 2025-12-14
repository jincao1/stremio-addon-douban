import { AsyncLocalStorage } from "node:async_hooks";
import type { Context, Env } from "hono";
import { createMiddleware } from "hono/factory";

const asyncLocalStorage = new AsyncLocalStorage<Context<Env>>();

export const contextStorage = createMiddleware<Env>(async (c, next) => {
  await asyncLocalStorage.run(c, next);
});

export const tryGetContext = () => {
  return asyncLocalStorage.getStore();
};

export const getContext = () => {
  const context = tryGetContext();
  if (!context) {
    throw new Error("Context is not available");
  }
  return context;
};
