import type { Context } from "hono";

export const isForwardUserAgent = (c: Context) => {
  const userAgent = c.req.header("User-Agent");
  return userAgent?.split(" ").some((item) => item.startsWith("forward/"));
};

export const makePosterUrl = (c: Context, doubanId: string | number) => {
  return `${new URL(c.req.url).origin}/poster/${doubanId}`;
}