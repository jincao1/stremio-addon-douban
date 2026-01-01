import type { Manifest } from "@stremio-addon/sdk";
import { type Env, Hono } from "hono";
import pkg from "@/../package.json" with { type: "json" };
import { api } from "@/libs/api";
import { getCatalogs } from "@/libs/catalog";
import { isForwardUserAgent } from "@/libs/utils";
import { idPrefixes } from "./meta";

export const manifestRoute = new Hono<Env>();

manifestRoute.get("/", async (c) => {
  const configId = c.req.param("config");
  const config = await api.getUserConfig(configId ?? "");
  const catalogs = await getCatalogs(config);
  const isInForward = isForwardUserAgent(c);

  const resources: Manifest["resources"] = ["catalog"];
  if (!isInForward) {
    resources.push("meta");
  }
  return c.json({
    id: `${pkg.name}.${configId}`,
    version: pkg.version,
    name: pkg.displayName,
    description: pkg.description,
    logo: "https://img1.doubanio.com/f/frodo/144e6fb7d96701944e7dbb1a9bad51bdb1debe29/pics/app/logo.png",
    types: ["movie", "series"],
    resources,
    catalogs,
    idPrefixes,
    behaviorHints: {
      configurable: true,
    },
  } satisfies Manifest);
});
