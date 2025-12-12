import type { Context } from "hono";

export const isForwardUserAgent = (c: Context) => {
  const userAgent = c.req.header("User-Agent");
  return userAgent?.split(" ").some((item) => item.startsWith("forward/"));
};

export const makePosterUrl = (url: string | undefined) => {
  return url ? `https://serveproxy.com/?url=${url}` : undefined;
}